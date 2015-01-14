$(document).ready(function() {
    console.log('Ready!');

    // Elements
    var $name = $('#scene-name');
    var $contents = $('#scene-contents');
    // var $submit = $('button#submit');
    var $img = $('img');
    var $console = $('#console');

    // State
    var preset = '';
    var imageUrl = "";

    // Helpers
    function loadPreset(cb) {
        $.get('/presets/scene1_02.txt')
            .done(function(data) {
                preset = data;
                $contents.val(preset);
                cb();
            });
    }

    function refreshImage() {
        var d = new Date();
        // Load
        $img.attr('src', imageUrl + "?" + d.getTime());
    }
    function render() {
        // Get data
        var name = $name.val();
        var contents = $contents.val();

        // Validate
        if (name.length < 2) {
            return;
        }
        if (contents.length < 5) {
            return;
        }

        // Send request
        var url = "/api/scene/" + name;
        $.post(url, {
                'contents': contents
            })
            .done(function(data) {
                console.log(data);
                if (data.error) {
                    $console.text(data.error);
                } else {
                    $console.text(data.console);
                    imageUrl = data.imageUrl;
                    refreshImage();
                }
            });
    }
    // Events
    // $submit.click(render);
    $name.keyup(render);
    $contents.keyup(render);

    loadPreset(function() {
        render();
    });

});
