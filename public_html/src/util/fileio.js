class FileIO {
    static get(filepath) {
        return $.ajax({
            type: "GET",
            url: filepath,
            async: false
        }).responseText;
    }

    static asyncGet(filepath, onload) {
        $.ajax({
            url: filepath,
            success: function (data) {
                onload(data);
            },
        });
    }
}

export {FileIO};
