/** used for different browser detection */
interface Window {
    INITIALIZED: boolean | undefined;
    opr: {addons: any};
    opera: any;
    HTMLElement: any;
    safari: any;
    StyleMedia: any;
    chrome: any;
}
interface Document {
    documentMode: any;
}

declare const InstallTrigger: any;
declare const  opr: {addons: any};
declare const safari: any;
