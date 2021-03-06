import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Web3 from 'aion-web3';
import { withStyles, Typography, Grid, Paper } from '@material-ui/core';
import { withTheme } from '@material-ui/core/styles';
import compose from 'recompose/compose';
import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';

const styles = theme => ({
    paper: {
        backgroundColor: theme.palette.background.default,
        marginTop: theme.spacing.unit * 2,
        padding: theme.spacing.unit * 3
    },
    fatLable: {
        fontWeight: 'bold',
        marginRight: theme.spacing.unit * 2,
        color: theme.palette.primary.main,
        minWidth: '45px'
    },
    thinLable: {
        fontWeight: 300,
        color: theme.palette.primary.main,
        wordBreak: 'break-all'
    },
    rawTitle: {
        fontWeight: 'bold',
        marginRight: theme.spacing.unit * 2,
        color: theme.palette.text.primary,
    },
    rawDetail: {
        fontWeight: 300,
        color: theme.palette.text.primary,
        wordBreak: 'break-all'
    },
    transactionRow: {
        marginTop: theme.spacing.unit * 1
    },
    continueButton: {
        marginLeft: theme.spacing.unit
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
        fontSize: 14,
    },
    error: {
        color: theme.palette.common.link,
        fontWeight: 'bold'
    }
})
class ConfirmStep extends Component {


    constructor(props) {
        super(props);
        this.state = {
            web3: null,
            errorMessage: null
        }
    }

    componentDidMount() {
        this.setState({ web3: new Web3(new Web3.providers.HttpProvider(this.props.web3Provider)) });
    }

    async sendTransaction() {
        try {
            await this.props.onTransactionStepContinue(this.props.transaction);
        } catch (error) {
            console.log(error)
            this.setState({ errorMessage: "Error sending transaction. Check your balance." })
        }
    }

    render() {
        const { classes, to, from, amount, nrg, nrgPrice, rawTransaction, onTransactonStepBack, currency, data } = this.props;
        const { errorMessage } = this.state;
        return (
            <div>
                <Grid spacing={0}
                    container
                    direction="column"
                    justify="flex-start">
                    <Typography variant="h4" style={{ fontWeight: 'bold', marginTop: '25px', marginBottom: '15px' }}>Confirm Transaction</Typography>
                    {errorMessage !== null ?
                        <Typography variant="subtitle2" className={classes.error}>{errorMessage}</Typography>
                        : null}

                    <Paper className={classes.paper}>
                        <Grid spacing={0}
                            container
                            direction="column"
                            justify="flex-start">
                            <Grid
                                container
                                direction="row"
                                justify="space-between"
                                alignItems="center"
                                wrap='nowrap'>
                                <Typography color="textSecondary" variant="subtitle2" className={classes.fatLable}>TO</Typography>
                                <Typography color="textSecondary" variant="subtitle2" className={classes.thinLable}>{to}</Typography>
                            </Grid>
                            <Grid
                                container
                                direction="row"
                                justify="space-between"
                                alignItems="center"
                                className={classes.transactionRow}
                                wrap='nowrap'>
                                <Typography color="textSecondary" variant="subtitle2" className={classes.fatLable}>FROM</Typography>
                                <Typography color="textSecondary" variant="subtitle2" className={classes.thinLable}>{from}</Typography>
                            </Grid>
                            <Grid
                                container
                                direction="row"
                                justify="space-between"
                                alignItems="center"
                                className={classes.transactionRow}
                                wrap='nowrap'>
                                <Typography color="textSecondary" variant="subtitle2" className={classes.fatLable}>AMOUNT</Typography>
                                <Typography color="textSecondary" variant="subtitle2" style={{ fontWeight: 'bold', color: '#113665' }}>{`${amount} ${currency?currency.name.toUpperCase():"AION"}`}</Typography>
                            </Grid>
                            <Grid
                                container
                                direction="row"
                                justify="space-between"
                                alignItems="center"
                                className={classes.transactionRow}
                                wrap='nowrap'>
                                <Typography color="textSecondary" variant="subtitle2" className={classes.fatLable}>NRG</Typography>
                                <Typography color="textSecondary" variant="subtitle2" className={classes.thinLable}>{Math.floor(nrg/1000)}k</Typography>
                            </Grid>
                            <Grid
                                container
                                direction="row"
                                justify="space-between"
                                alignItems="center"
                                className={classes.transactionRow}
                                wrap='nowrap'>
                                <Typography color="textSecondary" variant="subtitle2" className={classes.fatLable}>NRG PRICE</Typography>
                                <Typography color="textSecondary" variant="subtitle2" className={classes.thinLable}>{`${Math.floor(nrgPrice/Math.pow(10,9))} Amp`}</Typography>
                            </Grid>
                            {data && data!=='0x' ?
                                <Grid
                                    container
                                    direction="row"
                                    justify="space-between"
                                    alignItems="center"
                                    className={classes.transactionRow}
                                    wrap='nowrap'>
                                    <Typography color="textSecondary" variant="subtitle2" className={classes.fatLable}>DATA</Typography>
                                    <Typography color="textSecondary" variant="subtitle2" className={classes.thinLable}>{data}</Typography>
                                </Grid>
                            :null}
                        </Grid>

                    </Paper>
                    <Grid
                        container
                        spacing={0}
                        wrap="wrap"
                        direction="row"
                        justify="space-between"
                        alignItems="flex-start"
                        style={{ marginTop: '25px' }}>
                        <Grid item>
                            <Typography variant="subtitle2" className={classes.rawTitle}>Raw Transaction</Typography>
                        </Grid>
                        <Grid item xs>
                            <Typography variant="subtitle2" className={classes.rawDetail} >{rawTransaction}</Typography>
                        </Grid>
                    </Grid>
                    <Grid spacing={8}
                        container
                        direction="row"
                        justify="flex-end"
                        alignItems="flex-start"
                        style={{ paddingTop: '45px' }}>
                        <SecondaryButton
                            onClick={onTransactonStepBack}
                            text='Back' />
                        <PrimaryButton
                            showArrow
                            onClick={this.sendTransaction.bind(this)}
                            className={classes.continueButton}
                            text='Continue' />
                    </Grid>
                </Grid>

            </div>

        );
    }
}

ConfirmStep.propTypes = {
    classes: PropTypes.object.isRequired,
    onTransactionStepContinue: PropTypes.func.isRequired,
    onTransactonStepBack: PropTypes.func.isRequired,
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    nrg: PropTypes.number.isRequired,
    rawTransaction: PropTypes.string.isRequired,
    web3Provider: PropTypes.string.isRequired,
    transaction: PropTypes.object.isRequired,
};

export default compose(
    withStyles(styles, { name: 'ConfirmStep' }),
    withTheme()
)(ConfirmStep);
