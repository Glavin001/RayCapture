$(document).ready(function() {
    console.log('Ready!');

    // Elements
    var $name = $('#scene-name');
    var $contents = $('#scene-contents');
    // var $submit = $('button#submit');
    var $rasterImg = $('img.raster');
    var $depthImg = $('img.depth');
    var $normalsImg = $('img.normals');
    var $console = $('#console');
    var $width = $('#image-width');
    var $height = $('#image-height');
    var $depthMin = $('#depth-min');
    var $depthMax = $('#depth-max');

    // State
    var preset = '';
    var rasterImageUrl = "";
    var depthImageUrl = "";
    var normalsImageUrl = "";

    // Helpers
    function loadPreset(cb) {
        $.get('/presets/scene_custom.txt')
            .done(function(data) {
                preset = data;
                $contents.val(preset);
                cb();
            });
    }

    function refreshImage() {
        var d = new Date();
        // Load
        $rasterImg.attr('src', rasterImageUrl + "?" + d.getTime());
        $depthImg.attr('src', depthImageUrl + "?" + d.getTime());
        $normalsImg.attr('src', normalsImageUrl + "?" + d.getTime());
    }
    function render() {
        // Get data
        var name = $name.val();
        var contents = $contents.val();
        var width = $width.val() || 200;
        var height = $height.val() || 200;
        var depthMin = $depthMin.val() || 0;
        var depthMax = $depthMax.val() || 100;

        // Validate
        if (name.length < 2) {
            return;
        }
        if (contents.length < 5) {
            return;
        }

        // Send request
        var url = ["/api/scene/", name, '/', depthMin, '/', depthMax, "/", width, "/", height].join('');
        $.post(url, {
                'contents': contents
            })
            .done(function(data) {
                console.log(data);
                if (data.error) {
                    $console.text(data.error);
                } else {
                    $console.text(data.console);
                    rasterImageUrl = data.imageUrl;
                    depthImageUrl = data.depthImageUrl;
                    normalsImageUrl = data.normalsImageUrl;
                    refreshImage();
                }
            });
    }
    // Events
    // $submit.click(render);
    $name.keyup(render);
    $contents.keyup(render);
    $width.keyup(render);
    $height.keyup(render);
    $depthMin.keyup(render);
    $depthMax.keyup(render);

    loadPreset(function() {
        render();
    });

});
