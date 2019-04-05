import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Web3 from 'aion-web3';
import { withStyles, Grid, Typography } from '@material-ui/core'
import { withTheme } from '@material-ui/core/styles';
import compose from 'recompose/compose';
import WalletProvidersStep from './steps/WalletProvidersStep'
import SendStep from './steps/SendStep'
import ConfirmStep from './steps/ConfirmStep'
import { CheckCircleRounded, HighlightOffRounded } from '@material-ui/icons'
import LedgerProvider from '../utils/ledger/LedgerProvider';
import AionLogoLight from '../assets/aion_logo_light.svg'
import AionLogoDark from '../assets/aion_logo_dark.svg'
import PrimaryButton from '../components/PrimaryButton'
import { developmentProvider } from '../../global_config'
const Accounts = require('aion-keystore')

const styles = theme => ({
    continueButton: {
        float: 'right',
        marginTop: theme.spacing.unit * 4,
    },
    checkIcon: {
        fontSize: 84,
        color: theme.palette.common.green
    },
    errorIcon: {
        fontSize: 84,
        color: theme.palette.common.red
    },
    link: {
        color: '#00CEFF',
        fontWeight: 'light',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'block',
    },
    linkText: {
        marginTop: '20px'
    }

})
class UserTool extends Component {

    state = {
        step: 0,
        transactionData: {

        },
        account: null,
        privateKey: null,
        web3: new Web3(new Web3.providers.HttpProvider(this.props.web3Provider)),
        rawTransaction: null,
        checkLedger: false,
        transactionMessage: null,
        transactionStatus: 2,
        completed: 0,
    }
    componentDidMount() {
        this.onChangeStep(0)
    }
    handlePanelChange = panel => (event, expanded) => {
        this.setState({
            expanded: expanded ? panel : false,
            transactionData: {}
        });
    };
    onAccountImported = (account) => {
        const { externalTransaction } = this.props;
        if (externalTransaction) {
            console.log('Got external transaction:')
            console.log(externalTransaction)
            this.setState({
                account: account.address,
                privateKey: account.privateKey,
            })
        this.onSendStepContinue(null, 
            externalTransaction.from?externalTransaction.from:account.address, 
            externalTransaction.to, 
            externalTransaction.value, 
            externalTransaction.gas, 
            externalTransaction.gasPrice, 
            externalTransaction.data)
        } else {
            this.setState({
                step: 1,
                account: account.address,
                privateKey: account.privateKey,
            })
            this.onChangeStep(1)
        }

    }
    async signTransaction(transaction, addr, pk) {
        transaction.from=null;
        const aion = new Accounts();
        const account = aion.privateKeyToAccount(pk);
        const signedTransaction = await account.signTransaction(transaction);

        return signedTransaction;
    }
    toTransaction = (currency, from, to, amount, nrg, nrgPrice, data=null) => {
        if(!nrg){
            nrg=2000000;
        }
        if(!nrgPrice){
            nrgPrice=10000000000;
        }
        if(!from){
            from=this.state.account; 
        }

        let methodData = data;
        let aionAmount = parseInt(this.state.web3.toWei(amount, "ether"), 10);
        let actualReciepient = to;
        let nonce = parseInt(this.state.web3.eth.getTransactionCount(from), 10);
        if (!methodData&&currency&&currency.contract) {
            methodData = currency.contract.send.getData(
                to,
                amount * Math.pow(10, 18),
                '0x')
            aionAmount = 0;
            actualReciepient = currency.contract.address
        }
        return {
            nonce: nonce,
            from: from,
            gasPrice: nrgPrice,
            to: actualReciepient,
            value: aionAmount,
            gas: nrg,
            timestamp: Date.now() * 1000,
            data: methodData,
        };
    }
    onRequestGasEstimate = (currency, from, to, amount, nrg, nrgPrice) => {
        const transaction = this.toTransaction(currency, from, to, amount, nrg, nrgPrice)
        return this.state.web3.eth.estimateGas({ data: transaction })
    }
    onSendStepContinue = (currency, from, to, amount, nrg, nrgPrice, data=null) => {
        const transaction = this.toTransaction(currency, from, to, amount, nrg, nrgPrice, data)
        const transactionData = { currency, from, to, amount, nrg, nrgPrice }
        if (this.state.privateKey === 'ledger') {

            let ledgerConnection = new LedgerProvider()
            ledgerConnection.unlock(null).then((address) => {
                this.setState({ checkLedger: true });
                ledgerConnection
                .sign(transaction)
                    .then((signedTransaction) => {
                        this.setState({
                            checkLedger: false,
                            step: 2,
                            transactionData,
                            rawTransaction: signedTransaction.rawTransaction
                        })

                    }).catch((error) => {
                        console.trace(error)
                        this.setState({ checkLedger: false });
                        this.onSendStepBack();
                    })
            })
        } else {
            this.signTransaction(transaction, this.state.account, this.state.privateKey)
                .then((signedTransaction) => {
                    this.setState({
                        step: 2,
                        transactionData,
                        rawTransaction: signedTransaction.rawTransaction
                    })
                    this.onChangeStep(2)
                }).catch((error) => {
                    console.trace(error)
                    alert(error)
                })
        }

    }
    onSendStepBack = () => {
        this.setState({
            step: 0,
            transactionData:{},             
        })
        this.onChangeStep(0)
    }

    onTransactionStepContinue = (txHash) => {
        this.checkTransactionStatus(txHash)
        this.setState({
            txHash,
            step: 3
        })

        this.onChangeStep(3)
        if (this.props.callback) {
            this.props.callback(txHash, null)
        }
    }
    checkTransactionStatus = (hash) => {
        const timer = setInterval(() => {
            this.state.web3.eth.getTransactionReceipt(hash, (error, receipt) => {

                if (receipt) {
                    clearInterval(timer);
                    let status = parseInt(receipt.status, 16)
                    let message = status === 1 ? 'Succesfully Sent!' : 'Transaction error!';
                    this.setState({
                        step: 4,
                        completed: 1,
                        transactionStatus: status,
                        transactionMessage: message,
                        transactionData: {}
                    })
                    this.onChangeStep(4)
                    if (this.props.callback) {
                        this.props.callback(hash, status === 1)
                    }
                }
            })
        }, 5000);
    }
    onTransactionStepBack = () => {
        this.setState({
            step: this.props.externalTransaction?0:1,
            rawTransaction: null
        })

        this.onChangeStep(1)
    }
    onSentSuccess = () => {
        this.setState({
            step: 0,
            transactionData:{},  
            rawTransaction: null
        })
        this.onChangeStep(0)
    }
    onChangeStep = (step) => {
        this.props.onStepChanged(step, 4)
    }
    render() {
        const { classes, theme, showInfoHeader, web3Provider, defaultRecipient, currency, defaultAmount, defaultTokenAddress } = this.props;
        const { step, transactionData, txHash, rawTransaction, account, privateKey, checkLedger, transactionStatus, completed } = this.state;
        let content = null;
        let status = null;

        const isTestnet = web3Provider === developmentProvider;

        if (transactionStatus === 1) {
            status = <CheckCircleRounded className={classes.checkIcon} />
        } else if (transactionStatus === 0) {
            status = <HighlightOffRounded className={classes.errorIcon} />
        }

        switch (step) {
            case 0: { // Account import
                content = (<WalletProvidersStep
                    onAccountImported={this.onAccountImported}
                    showInfoHeader={showInfoHeader}
                    web3Provider={web3Provider}
                />);
                break;
            }
            case 1: { // Send
                content = (<SendStep
                    account={account}
                    onSendStepContinue={this.onSendStepContinue}
                    onSendStepBack={this.onSendStepBack}
                    onRequestGasEstimate={this.onRequestGasEstimate}
                    currency={transactionData.currency}//following data is in the case of 'back' navigation
                    from={transactionData.from}
                    to={transactionData.to}
                    amount={transactionData.amount}
                    nrg={transactionData.nrg}
                    nrgPrice={transactionData.nrgPrice}
                    rawTransaction={rawTransaction}
                    checkLedger={checkLedger}
                    defaultRecipient={defaultRecipient}
                    defaultAmount={defaultAmount}
                    defaultTokenAddress={defaultTokenAddress}
                    web3Provider={web3Provider}
                />);
                break;
            }
            case 2: { // Confirm
                content = (<ConfirmStep
                    onTransactionStepContinue={this.onTransactionStepContinue}
                    onTransactonStepBack={this.onTransactionStepBack}
                    currency={transactionData.currency}
                    from={transactionData.from}
                    to={transactionData.to}
                    amount={transactionData.amount}
                    nrg={transactionData.nrg}
                    nrgPrice={transactionData.nrgPrice}
                    rawTransaction={rawTransaction}
                    privateKey={privateKey}
                    web3Provider={web3Provider}
                />);
                break;
            }
            case 3:
            case 4: { //Done
                content = (
                    <Grid spacing={0}
                        container
                        direction="column"
                        justify="center"
                        alignItems="center"
                        wrap='nowrap'>
                        {
                            (completed === 1) ?
                                status :
                                <Grid spacing={0}
                                    container
                                    direction="column"
                                    justify="center"
                                    alignItems="center">
                                    <img alt="Aion Logo" className={'rotation'} src={theme.palette.isWidget ? AionLogoDark : AionLogoLight} width="90px" />
                                    <Typography variant="h4" style={{ fontWeight: 'bold', marginTop: '30px' }}>Sending {currency}</Typography>
                                    <Typography variant="subtitle2" style={{ fontWeight: 'light', marginTop: '20px' }}> Sending transaction and waiting for at least one block confirmation.</Typography>
                                    <Typography variant="subtitle2" style={{ fontWeight: 'light' }}> Please be patient this wont't take too long...</Typography>
                                </Grid>
                        }

                        <Typography variant="h4" style={{ fontWeight: 'bold', marginTop: '30px' }}>{this.state.transactionMessage}</Typography>

                        <Grid
                            container
                            direction="row"
                            justify="space-between"
                            alignItems="center"
                            className={classes.linkText}
                            wrap='nowrap'>
                            <Typography style={{ whiteSpace: 'nowrap' }} variant="subtitle2">{'Transaction Hash: '}</Typography>
                            <a target='_blank' rel='noopener noreferrer' className={classes.link} href={`https://${isTestnet ? 'mastery' : 'mainnet'}.aion.network/#/transaction/${txHash}`}>{txHash}</a>

                        </Grid>
                        {
                            (completed === 1) ?
                                <PrimaryButton
                                    onClick={(event) => { this.onSentSuccess() }}
                                    className={classes.continueButton}
                                    text='Done' />
                                :
                                null
                        }
                    </Grid>)
                break;
            }
            default: {
                content = (null);
            }
        }

        return (
            content
        );
    }
}

UserTool.propTypes = {
    classes: PropTypes.object.isRequired,
    onStepChanged: PropTypes.func.isRequired,
    web3Provider: PropTypes.string.isRequired,
};

export default compose(
    withStyles(styles, { name: 'UserTool' }),
    withTheme()
)(UserTool);
