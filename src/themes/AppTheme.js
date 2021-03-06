import { createMuiTheme } from '@material-ui/core/styles';
const AppPalette = {
    primary: { main: '#113665', contrastText: '#fff' },
    secondary: { main: '#F2F6FA', contrastText: '#113665' },
    type: 'dark',
    isWidget: false,
    background: { default: '#DCE1ED', white: '#fff', warning: '#E89000', error: '#e03051', blueGradient: 'linear-gradient(225deg, #08023C, #229DB7 80%);', dropDown: '#113665'},
    text: {
        primary: '#F2F6FA',
        secondary: '#113665',
        disabled: '#113665',
        hint: '#2A2C2E',
        primaryLight: '#819ABA'
    },
    common: {
        green: '#5AF0BD',
        red: '#e50000',
        black: '#000',
        white: '#fff',
        icon: '#d2dbe6',
        primaryButton: '#2197B3',
        primaryButtonDisabled: 'rgba(33,151,179,0.4)',
        underline:'#D8D8D8',
        underlineFocused:'#113665',
        underlineContrast:'#D8D8D8',
        underlineFocusedContrast:'#D8D8D8',
        link: '#00d0fe',
    },
    providerPanel: {
        background: '#fff',
        border: '#5AF0BD',
        text: '#113665'
    },
}
const WidgetPalette = {
    primary: { main: '#113665', contrastText: '#fff' },
    secondary: { main: '#113665', contrastText: '#fff' },
    type: 'dark',
    isWidget: true,
    background: { default: '#ECF1F7', white: '#fff', warning: '#E89000', error: '#e03051', blueGradient: 'linear-gradient(225deg, #08023C, #229DB7);', dropDown: '#fff' },//can cause issues when exported as a widget lib
    text: {
        primary: '#113665',
        secondary: '#F2F6FA',
        disabled: '#F2F6FA',
        hint: '#2A2C2E',
        primaryLight: '#819ABA',
    },
    common: {
        green: '#5AF0BD',
        black: '#000',
        white: '#fff',
        icon: '#d2dbe6',
        primaryButton: '#113665',
        primaryButtonDisabled: 'rgba(17, 54, 101, 0.4)',
        underline:'#D8D8D8',
        underlineFocused:'#113665',
        underlineContrast:'#113665',
        underlineFocusedContrast:'#113665',
        link: '#00d0fe',
    },
    providerPanel: {
        background: '#ECF1F7',
        border: '#0D1F53',
        text: '#113665'
    },
    aionPay:{
        textColor:'#ffffff',
        backgroundColor:'#113665',
        fontWeight:'500',
        fontSize:'11px',
        paddingTop:'6p',
        paddingBottom:'6p',
        paddingLeft:'16p',
        paddingRight:'16p',
    }
}
const AppTypography = {
    useNextVariants: true,
    fontFamily: ['Lato'],//can cause issues when exported as a widget lib
}

const AppShape ={
    borderRadius: 2
}
const AppTheme = createMuiTheme({
    palette: AppPalette,
    typography: AppTypography,
    shape: AppShape,
});
const WidgetTheme = createMuiTheme({
    palette: WidgetPalette,
    typography: AppTypography,
    shape: AppShape,
});

export { AppTheme, WidgetTheme };
