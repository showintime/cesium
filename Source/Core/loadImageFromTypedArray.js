define([
        '../ThirdParty/when',
        './Check',
        './defined',
        './defaultValue',
        './FeatureDetection',
        './Resource'
    ], function(
        when,
        Check,
        defined,
        defaultValue,
        FeatureDetection,
        Resource) {
    'use strict';

    /**
     * @private
     */
    function loadImageFromTypedArray(options) {
        var uint8Array = options.uint8Array;
        var format = options.format;
        var request = options.request;
        var flipY = defaultValue(options.flipY, true);
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.object('uint8Array', uint8Array);
        Check.typeOf.string('format', format);
        //>>includeEnd('debug');

        var blob = new Blob([uint8Array], {
            type : format
        });

        // Avoid an extra fetch by just calling createImageBitmap here directly on the blob
        // instead of sending it to Resource as a blob URL.
        if (FeatureDetection.supportsCreateImageBitmap()) {
            return Resource.supportsImageBitmapOptions()
                .then(function(supportsBitmapOptions) {
                    if (supportsBitmapOptions) {
                        return when(createImageBitmap(blob, {
                            imageOrientation: flipY ? 'flipY' : 'none'
                        }));
                    }

                    return when(createImageBitmap(blob));
                });
        }

        var blobUrl = window.URL.createObjectURL(blob);
        var resource = new Resource({
            url: blobUrl,
            request: request
        });
        return resource.fetchImage()
            .then(function(image) {
                window.URL.revokeObjectURL(blobUrl);
                return image;
            }, function(error) {
                window.URL.revokeObjectURL(blobUrl);
                return when.reject(error);
            });
    }

    return loadImageFromTypedArray;
});
