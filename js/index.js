(function (window, $, undefined) {
    "use strict";

    $(function() {
        // Apply animation of teaser images when scrolling down.
        var $image = $('.post-image-image, .teaserimage-image');
        if ($image.length) {
            var $window = $(window);

            $window.on('scroll', function() {
                var top = $window.scrollTop();
                if (top < 0 || top > 1500) {
                    return;
                }

                $image
                    .css('transform', 'translate3d(0px, '+top/3+'px, 0px)')
                    .css('opacity', 1-Math.max(top/700, 0))
                ;
            });

            $window.trigger('scroll');
        }

        // Apply padding to post, if there is a teaser article image present.
        if ($('.article-image').length) {
            var height = $('.article-image').height();
            $('.post-content').css('padding-top', height + 'px');
        }

        // Apply smooth scrolling within the page itself.
        $('a[href*=#]:not([href=#])').click(function() {
            if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) +']');

                if (target.length) {
                    $('html,body').animate({ scrollTop: target.offset().top }, 500);

                    return false;
                }
            }
        });

        // Create figures from images
        $(".post-content img").each(function() {
            // Favor title over alt, if given.
            var caption = $(this).attr("title") || $(this).attr("alt");
            if (caption) {
                $(this)
                    .wrap('<figure class="image"></figure>')
                    .after('<figcaption>'+caption+'</figcaption>')
                ;
            }
        });
    });
}(window, window.jQuery));
