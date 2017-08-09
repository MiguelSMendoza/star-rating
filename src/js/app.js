(function($, window, document, undefined) {

    $.fn.msmstarratings = function(options) {
        $.fn.msmstarratings.options = $.extend({
            ajaxurl: null,
            nonce: null,
            func: null,
            grs: false,
            msg: 'Rate this post',
            fuelspeed: 400,
            thankyou: 'Thank you for rating.',
            error_msg: 'An error occured.',
            tooltip: true,
            tooltips: {
                0: {
                    tip: "Poor",
                    color: "red"
                },
                1: {
                    tip: "Fair",
                    color: "brown"
                },
                2: {
                    tip: "Average",
                    color: "orange"
                },
                3: {
                    tip: "Good",
                    color: "blue"
                },
                4: {
                    tip: "Excellent",
                    color: "green"
                }
            }
        }, $.fn.msmstarratings.options, options ? options : {});

        var Objs = [];
        this.each(function() {
            Objs.push($(this));
        });

        $.fn.msmstarratings.fetch(Objs, 0, '0%', $.fn.msmstarratings.options.msg, true);

        return this.each(function() {});

    };

    $.fn.msmstarratings.animate = function(obj) {
        if (!obj.hasClass('disabled')) {
            var legend = $('.msm-legend', obj).html(),
                fuel = $('.msm-fuel', obj).css('width');
            $('.msm-stars a', obj).hover(function() {
                var stars = $(this).attr('href').split('#')[1];
                if ($.fn.msmstarratings.options.tooltip != 0) {
                    if ($.fn.msmstarratings.options.tooltips[stars - 1] != null) {
                        $('.msm-legend', obj).html('<span style="color:' + $.fn.msmstarratings.options.tooltips[stars - 1].color + '">' + $.fn.msmstarratings.options.tooltips[stars - 1].tip + '</span>');
                    } else {
                        $('.msm-legend', obj).html(legend);
                    }
                }
                $('.msm-fuel', obj).stop(true, true).css('width', '0%');
                $('.msm-stars a', obj).each(function(index, element) {
                    var a = $(this),
                        s = a.attr('href').split('#')[1];
                    if (parseInt(s) <= parseInt(stars)) {
                        $('.msm-stars a', obj).stop(true, true);
                        a.hide().addClass('msm-star').addClass('orange').fadeIn('fast');
                    }
                });
            }, function() {
                $('.msm-stars a', obj).removeClass('msm-star').removeClass('orange');
                if ($.fn.msmstarratings.options.tooltip != 0) $('.msm-legend', obj).html(legend);
                $('.msm-fuel', obj).stop(true, true).animate({ 'width': fuel }, $.fn.msmstarratings.options.fuelspeed);
            }).unbind('click').click(function() {
                return $.fn.msmstarratings.click(obj, $(this).attr('href').split('#')[1]);
            });
        } else {
            $('.msm-stars a', obj).unbind('click').click(function() { return false; });
        }
    };

    $.fn.msmstarratings.update = function(obj, per, legend, disable, is_fetch) {
        if (disable == 'true') {
            $('.msm-fuel', obj).removeClass('yellow').addClass('orange');
        }
        $('.msm-fuel', obj).stop(true, true).animate({ 'width': per }, $.fn.msmstarratings.options.fuelspeed, 'linear', function() {
            if (disable == 'true') {
                obj.addClass('disabled');
                $('.msm-stars a', obj).unbind('hover');
            }
            if (!$.fn.msmstarratings.options.grs || !is_fetch) {
                $('.msm-legend', obj).stop(true, true).hide().html(legend ? legend : $.fn.msmstarratings.options.msg).fadeIn('slow', function() {
                    $.fn.msmstarratings.animate(obj);
                });
            } else {
                $.fn.msmstarratings.animate(obj);
            }
        });
    };

    $.fn.msmstarratings.click = function(obj, stars) {
        $('.msm-stars a', obj).unbind('hover').unbind('click').removeClass('msm-star').removeClass('orange').click(function() { return false; });

        var legend = $('.msm-legend', obj).html(),
            fuel = $('.msm-fuel', obj).css('width');

        $.fn.msmstarratings.fetch(obj, stars, fuel, legend, false);

        return false;
    };

    $.fn.msmstarratings.fetch = function(obj, stars, fallback_fuel, fallback_legend, is_fetch) {
        var postids = [];
        $.each(obj, function() {
            //$(this).attr('data-id', window.location.pathname);
            postids.push($(this).attr('data-id'));
        });
        $.ajax({
            url: $.fn.msmstarratings.options.ajaxurl,
            data: 'id=' + postids + '&stars=' + stars,
            type: "post",
            dataType: "json",
            beforeSend: function() {
                $.each(obj, function() {
                    var current = $(this);
                    $('.msm-fuel', current).animate({ 'width': '0%' }, $.fn.msmstarratings.options.fuelspeed);
                    if (stars) {
                        $('.msm-legend', current).fadeOut('fast', function() {
                            $('.msm-legend', current).html('<span style="color: green">' + $.fn.msmstarratings.options.thankyou + '</span>');
                        }).fadeIn('slow');
                    }
                });
            },
            success: function(response) {
                $.each(obj, function() {
                    var current = $(this),
                        current_id = current.attr('data-id');
                    if (response[current_id].success) {
                        $.fn.msmstarratings.update(current, response[current_id].fuel + '%', response[current_id].legend, response[current_id].disable, is_fetch);
                    } else {
                        $.fn.msmstarratings.update(current, fallback_fuel, fallback_legend, false, is_fetch);
                    }
                });
            },
            complete: function() {

            },
            error: function(e) {
                $.each(obj, function() {
                    var current = $(this);
                    $('.msm-legend', current).fadeOut('fast', function() {
                        $('.msm-legend', current).html('<span style="color: red">' + $.fn.msmstarratings.options.error_msg + '</span>');
                    }).fadeIn('slow', function() {
                        $.fn.msmstarratings.update(current, fallback_fuel, fallback_legend, false, is_fetch);
                    });
                });
            }
        });
    };

    $.fn.msmstarratings.options = {
        ajaxurl: '/API/Stars/',
        func: null,
        nonce: null,
        grs: false,
        tooltip: false,
        tooltips: {
            0: {
                tip: "Malo",
                color: "red"
            },
            1: {
                tip: "Justo",
                color: "brown"
            },
            2: {
                tip: "Regular",
                color: "orange"
            },
            3: {
                tip: "Bueno",
                color: "blue"
            },
            4: {
                tip: "Excelente",
                color: "green"
            }
        },
        msg: 'Valora esta página',
        fuelspeed: 400,
        thankyou: '¡Gracias por tu voto!',
        error_msg: 'Ha ocurrido un error.'
    };

})(jQuery, window, document);

jQuery(document).ready(function($) {
    $('.msm-star-ratings').msmstarratings();
});