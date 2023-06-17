let prevHref;
let prevHost;
let prevHostname;
let prevProtocol;

class S3Utils {
    static SETTINGS = {
        CUSTOM_PREFIX: "custom_prefix",
        CUSTOM_STYLE: "custom_style",
        BUCKETNAME: "bucketname",
        CUSTOMBUCKET: "custombucket"
    }
    static ID = 's3-path-url'

    static initialize(){
        if (!game.modules.get('lib-wrapper')?.active) {
            if(game.user.isGM){
                ui.notifications.error("Module S3 Custom URL requires the 'libWrapper' module. Please install and activate it.");
            }
            return;
        }

        //Register Setting

        this.registerSettings();

        //Register Wrappers

        this.registerWrappers();
    }

    static overrideData(){
        if (!game.modules.get('lib-wrapper')?.active) {
            return;
        }

        if(game.settings.get(this.ID, this.SETTINGS.CUSTOM_STYLE)){
            prevHref = game.data.files.s3.endpoint.href;
            prevHost = game.data.files.s3.endpoint.host;
            prevHostname = game.data.files.s3.endpoint.hostname;
            prevProtocol = game.data.files.s3.endpoint.protocol;

            game.data.files.s3.endpoint.hostname = game.settings.get(this.ID, this.SETTINGS.CUSTOM_PREFIX);
            game.data.files.s3.endpoint.host = game.settings.get(this.ID, this.SETTINGS.CUSTOM_PREFIX);
            game.data.files.s3.endpoint.href = game.data.files.s3.endpoint.protocol + "//" + game.settings.get(this.ID, this.SETTINGS.CUSTOM_PREFIX);
            game.data.files.s3.endpoint.protocol = game.settings.get(this.ID, this.SETTINGS.CUSTOM_PREFIX).split(':')[0]+":";
        }

    }

    static registerSettings(){
        game.settings.register(this.ID, this.SETTINGS.CUSTOM_PREFIX, {
            name: `S3_PATH_URL.settings.${this.SETTINGS.CUSTOM_PREFIX}.Name`,
            default: "url.to.endpoint.com",
            type: String,
            scope: 'world',
            config: true,
            hint: `S3_PATH_URL.settings.${this.SETTINGS.CUSTOM_PREFIX}.Hint`,
        });
        game.settings.register(this.ID, this.SETTINGS.BUCKETNAME, {
            name: `S3_PATH_URL.settings.${this.SETTINGS.BUCKETNAME}.Name`,
            type: String,
            scope: 'world',
            default: 'foundry',
            config: true,
            hint: `S3_PATH_URL.settings.${this.SETTINGS.BUCKETNAME}.Hint`,
        });

        game.settings.register(this.ID, this.SETTINGS.CUSTOM_STYLE, {
            name: `S3_PATH_URL.settings.${this.SETTINGS.CUSTOM_STYLE}.Name`,
            default: false,
            type: Boolean,
            scope: 'world',
            config: true,
            hint: `S3_PATH_URL.settings.${this.SETTINGS.CUSTOM_STYLE}.Hint`,
        });
        game.settings.register(this.ID, this.SETTINGS.CUSTOMBUCKET, {
            name: `S3_PATH_URL.settings.${this.SETTINGS.CUSTOMBUCKET}.Name`,
            default: false,
            type: Boolean,
            scope: 'world',
            config: true,
            hint: `S3_PATH_URL.settings.${this.SETTINGS.CUSTOMBUCKET}.Hint`,
        });
    }

    static registerWrappers(){
        libWrapper.register(this.ID, "FilePicker.upload", async function (wrapped, ...args) {
            let result = await wrapped(...args);
            if (args[0] === "s3" && !!result.path) {
                result.path = S3Utils.transformURL(result.path);
            }
            return result;
        }, libWrapper.WRAPPER);
        libWrapper.register(this.ID, "FilePicker.browse", async function (wrapped, ...args) {
            let result = await wrapped(...args);
            if (args[0] === "s3") {
                result.files?.forEach((file, index) => {
                    result.files[index] = S3Utils.transformURL(file);
                });
            }
            return result;
        }, libWrapper.WRAPPER);
        libWrapper.register(this.ID, "FilePicker.matchS3URL", function (wrapped, ...args){
            let result = wrapped(...args);
            if(result){
                if (game.settings.get('s3-path-url', "custom_style")&&game.settings.get('s3-path-url', "custombucket")){
                    let bucketName = game.settings.get('s3-path-url', "bucketname");
                    if(result.groups.bucket != bucketName){
                        result.groups.key = result.groups.bucket + "/" + result.groups.key;
                        result.groups.bucket = bucketName;
                    }
                }
            }
            return result;
        }, libWrapper.WRAPPER);
        if (game.modules.get('moulinette-core')?.active) {
            libWrapper.register(this.ID, "game.moulinette.applications.MoulinetteFileUtil.getBaseURL", async function (wrapped, ...args){
                let result = await wrapped(...args);
                if(result != "" && result){
                    result = S3Utils.transformURL(result);
                }
                return result;
            });
        }
    }

    /**
     *
     * @param {string} url
     * @returns string
     */
    static transformURL(url) {
        const splitHref = prevHref.split('//')
        if(game.settings.get('s3-path-url', "custom_style")) {
            if (url.startsWith(prevHref)) {
                return url.replace(prevHref, game.data.files.s3.endpoint.href);
            }
            if (url.includes(splitHref[1])){
                // if URL has been mangled by some other module, discard anything before the href without the protocol.
                return game.data.files.s3.endpoint.href + url.split(splitHref[1])[1];
            }
        }

        return url;
    }
}

Hooks.once('init', async function () {
    S3Utils.initialize();
});

Hooks.once('ready', async function (){
    S3Utils.overrideData();
});

let S3Utilss = {
    createS3URL: S3Utils.createS3URL
}

window.S3Utils = S3Utilss;
