
$(function() {
    if(document.getElementById("editormd")){
        var editor = editormd("editormd", {
            path : "/public/editor.md/lib/",
            width: "95%",
            height: "50%",
            saveHTMLToTextarea: true,
        });
    }

    if(document.getElementById("viewermd")){
        var viewer = editormd.markdownToHTML("viewermd", {
            htmlDecode: true,
            emoji           : true,
            taskList        : true,
            tex             : true,  // 默认不解析
            flowChart       : true,  // 默认不解析
            sequenceDiagram : true,  // 默认不解析
        });
    }

});