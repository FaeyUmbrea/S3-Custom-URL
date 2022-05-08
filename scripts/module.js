class S3CustomUrl {
    static SETTINGS = {
        CUSTOM_PREFIX: "custom_prefix",
        PATH_STYLE: "path_style",
        CUSTOM_STYLE: "custom_style",
    }
    static ID = 's3-custom-url'

    static initialize(){
        if (!game.modules.get('lib-wrapper')?.active && game.user.isGM) {
            ui.notifications.error("Module S3 Custom URL requires the 'libWrapper' module. Please install and activate it.");
            return;
        }
    
        //Register Setting

        this.registerSettings();
    
        //Register Wrappers

        this.registerWrappers();
    }

    static registerSettings(){
        game.settings.register(this.ID, this.SETTINGS.PATH_STYLE, {
            name: `S3_CUSTOM_URL.settings.${this.SETTINGS.PATH_STYLE}.Name`,
            default: true,
            type: Boolean,
            scope: 'world',
            config: true,
            hint: `S3_CUSTOM_URL.settings.${this.SETTINGS.PATH_STYLE}.Hint`,
        });
    
        game.settings.register(this.ID, this.SETTINGS.CUSTOM_PREFIX, {
            name: `S3_CUSTOM_URL.settings.${this.SETTINGS.CUSTOM_PREFIX}.Name`,
            default: "https://url.to.endpoint.com/bucket/",
            type: String,
            scope: 'world',
            config: true,
            hint: `S3_CUSTOM_URL.settings.${this.SETTINGS.CUSTOM_PREFIX}.Hint`,
        });

        game.settings.register(this.ID, this.SETTINGS.CUSTOM_STYLE, {
            name: `S3_CUSTOM_URL.settings.${this.SETTINGS.CUSTOM_STYLE}.Name`,
            default: false,
            type: Boolean,
            scope: 'world',
            config: true,
            hint: `S3_CUSTOM_URL.settings.${this.SETTINGS.CUSTOM_STYLE}.Hint`,
        });
    }

    static registerWrappers(){
        libWrapper.register(this.ID, "FilePicker.upload", async function (wrapped, ...args) {
            let result = await wrapped(...args);
            if (args[0] === "s3") {
                let originalURL = result.path;
                result.path = transformURL(originalUrl);
            }
            return result;
        }, libWrapper.WRAPPER);
        libWrapper.register(this.ID, "FilePicker.browse", async function (wrapped, ...args) {
            let result = await wrapped(...args);
            if (args[0] === "s3") {
                console.log(result);
                result.files?.forEach((file, index) => {
                    let originalUrl = file
                    result.files[index] = S3CustomUrl.transformURL(originalUrl);
                });
            }
            return result;
        }, libWrapper.WRAPPER);
    }

    static transformURL(url) {
        var newUrl = url,
            tokens = newUrl.split("/"),
            path = tokens.slice(3).join("/"),
            vhostBucket = tokens[2],
            bucket = vhostBucket.split(".")[0];
    
        return this.createS3URL(bucket,path);
    }

    static createS3URL(bucket, filepath){
        let uri;
        if (!game.settings.get('s3-custom-url', "custom_style")&&game.settings.get('s3-custom-url',"path_style")){
            uri = 
            game.data.files.s3.endpoint.protocol + 
            "//" + 
            game.data.files.s3.endpoint.hostname + 
            "/" +
            bucket +
            "/" +
            filepath
        }
        else if(game.settings.get('s3-custom-url', "custom_style")){
            uri = game.settings.get('s3-custom-url', "custom_prefix") + filepath;   
        }
        else{
            uri = 
            game.data.files.s3.endpoint.protocol +
            "//" +
            bucket +
            "." +
            game.data.files.s3.endpoint.hostname +
            "/" +
            filepath;
        }
        return uri;
    }
}

Hooks.once('init', async function () {
    S3CustomUrl.initialize();
});

let S3CustomURL = {
    createS3URL: S3CustomUrl.createS3URL
}

window.S3CustomURL = S3CustomURL;