# What is this module

This module is a simple dropin module that will allow path style object storage to work with Foundry.

There also is experimental support for really wierd URL styles.

## Why?

A lot of people, myself included, have bought cheap object storage with an alternative provider, only to realize that their provider of choice does not support the format that foundry wants from us. 

## How? 

Foundry only ever actually touches the S3 API when you upload stuff or when you request a directory's item list. 
As such, the backend actually never handles your S3 Object Storage after you leave the FilePicker.
This allows a frontend module to take what ever malformed URL the backend gives us and transform it into the correct format.

S3 Custom URL patches the 2 FilePicker methods that interact with the Backend generated URLs using libWrapper and modifies the URL to fit the configured scheme automagically.
It also provides the method S3CustomURL.createS3URL which takes the bucket and the filepath and spits out the URL for you. This is mainly so modules can make use of it.

## Ok now how do I use this?

Simple, there really is only 2 usecases this module covers (3 if you count all features disabled)

### 1) I want bucket Style URLs (99% of Users)

If your urls look like this: "http(s)://\[url of endpoint]/\[bucket]/\[path to file]

Then all you have to do, is tick the "Path Style" checkbox in the Settings and leave the other one unchecked.

This is actually the default, so can just install the module and are good to go!

### 2) My Hoster does something wierd

If your urls don't like anything like the stuff Amazon would give you, you can check the "Custom Style" checkbox in settings and enter what ever wierd prefix for the bucket your provider expects.
Please be advised that ALL URLs generated by this module will be modified for what ever you enter here, so you wont be able to change the bucket anymore.
URLs from other buckets still work by just pasting them into the file pickers text-box.

This feature is very experimental and might break easily. Expect foundry to behave very wierdly if you ever use it and then turn it off.
