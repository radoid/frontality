'use strict';

var DEBUG;


/* Collapse & Accordion */

(function ($) {
	$.extend ($.fn, {

		'collapse': function (options) {
			var $element = this;
			if (options == 'toggle') {
				options = ($element.hasClass('in') ? 'hide' : 'show');
			}
			if (options == 'show') {
				$element.addClass('in').trigger('show');
				$element.css('height', this[0].scrollHeight + 'px');
				setTimeout(function () {
					$element.trigger('shown');
					if ($element.offset().top < $(window).scrollTop() || $element.height() > $(window).height())
						$('html, body').animate({scrollTop: $element.offset().top - 50});
				}, 220);
			}
			if (options == 'hide') {
				$element.removeClass('in').trigger('hide');
				$element.css('height', '0');
				setTimeout(function () {
					$element.trigger('hidden');
				}, 220);
			}
			return this;
		}

	});

	$(document).ready(function () {
		$('[data-toggle="collapse"][href], [data-toggle="collapse"][data-target]').click(function () {
			var $collapse = $(this.href || $(this).data('target')).collapse('toggle');
			$($(this).data('parent')).find('.collapse.in').not($collapse).collapse('hide');
		});
	});

}) (window.jQuery || window.Zepto);


/* Modal */

(function ($) {
	$.extend ($.fn, {

		'modal': function (options) {
			var $element = this;
			var $container = this.data('container') || $(
				'<div class="modal-backdrop"></div>')
					.on('mousedown', '.modal', function (e) {
						e.stopImmediatePropagation();
					})
					.on('mousedown', function (e) {
						$element.modal('hide');
						e.stopPropagation();
					})
					.on('click', '[data-dismiss="modal"]', function (e) {
						$(this).closest('.modal').modal('hide');
						e.stopPropagation();
					});

			if (options != 'hide')
				if (!this.data('modal_level')) {
					this.trigger('show');
					var level = +$(document.body).data('modal_level') + 1 || 1;
					this.data({container: $container, 'modal_level': level});
					$container.append(this.css({display: 'inline-block'})).css({display: 'flex'});
					$(document.body).append($container.show()).addClass('modal-open').data('modal_level', level);
					this.trigger('shown');

					$(document).on('keydown.'+level, function (e) {
						if (e.which == 27 && $(document.body).data('modal_level') == $element.data('modal_level')) {
							$element.modal('hide');
							e.stopPropagation();
						}
					});
				}

			if (options == 'hide')
				if (this.data('modal_level')) {
					this.trigger('hide');
					$container.hide();
					var level = Math.max(0, +$(document.body).data('modal_level') - 1 || 0);
					$(document.body).data('modal_level', level).toggleClass('modal-open', level > 0);
					$(document).off('keydown.'+this.data('modal_level'));
					this.data('modal_level', false);
					this.trigger('hidden');
				}

			return this;
		}

	});

	$.dialog = function (title, html, buttons) {
		var $modal = $('#frontality-generic-dialog').length ? $('#frontality-generic-dialog') : $(
			'<div id="modal-generic-dialog" class="modal modal-dialog modal-narrow">' +
				'<span class="close" data-dismiss="modal">&times;</span>' +
				'<h3 class="modal-header">' +
				'</h3>' +
				'<div class="modal-body"></div>' +
				'<div class="modal-footer"></div>' +
			'</div>');
		$('.modal-header', $modal).text(title);
		$('.modal-body', $modal).html(html);
		$('.modal-footer', $modal).empty();
		for (var i in buttons)
			if (buttons.hasOwnProperty(i))
				$('.modal-footer', $modal).append($('<button data-dismiss="modal">').html(i).click(buttons[i]));
		$modal.modal('show');
	};

	$(document).ready(function () {
		$('[data-toggle="modal"][href], [data-toggle="modal"][data-target]').click(function () {
			$($(this).attr('href') || $(this).data('target')).modal('show');
		})
	});

}) (window.jQuery || window.Zepto);


/* Covers */

(function ($) {

	$.extend ($.fn, {

		'cover': function (state, content) {
			var $element = (this.hasClass('modal') ? $('.modal-content', this) : this);
			if (state || state === undefined)
				$element.css({position: 'relative'}).wrapInner('<div class="cover-under">').append($('<div class="cover ' + (state || '') + '"><div class="cover-content">' + (content || '') + '</div></div>'));
			else
				$element.html($element.children('.cover-under')[0].childNodes);
			return this;
		},

		'loading': function (state) {
			if (state || state === undefined)
				return this.cover('cover-loading', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle transform="translate(8 0)" cx="0" cy="16" r="0"><animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0" keytimes="0;0.2;0.7;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline" /></circle><circle transform="translate(16 0)" cx="0" cy="16" r="0"><animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0.3" keytimes="0;0.2;0.7;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline" /></circle><circle transform="translate(24 0)" cx="0" cy="16" r="0"><animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0.6" keytimes="0;0.2;0.7;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline" /></circle></svg>');
			return this.cover(false);
		}

	});

}) (window.jQuery || window.Zepto);


/* AJAX Buttons */

(function ($) {

	$.extend ($.fn, {

		'ajax': function (method, url, data, success, error, progress) {
			var $button = this;
			var pressable = (this[0].tagName == "BUTTON");
			$button.prop('disabled', true);
			//if (pressable)
			//	$button.loading(true);
			var formdata, i;
			if (data instanceof $)
				if (data[0] && data[0].files && typeof FormData != 'undefined')
					for (formdata = new FormData(), i=0; i < data[0].files.length; i++)
						//if (DEBUG) console.log('Upload '+i+' start', data[0].files[i]);
						formdata.append("upload"+i, data[0].files[i]);
				else
					data = (typeof FormData != 'undefined' ? (formdata = new FormData(data[0])) : data.serialize());
			if (typeof progress == "function")
				progress.call($button[0], 0);
			$.ajax(url, {type: method, cache: false, data: formdata || data,
				processData: !formdata,
	        	contentType: (formdata ? false : $.ajaxSettings.contentType),
				beforeSend: function(jqxhr, settings) {
					jqxhr.setRequestHeader('Accept', '*/json');
				},
				xhr: function () {
					var xhr = $.ajaxSettings.xhr();
					if (xhr.upload && typeof progress == 'function')
						xhr.upload.addEventListener('progress', function (e) {
							if (DEBUG) console.log('Upload progress:', e.loaded, e.total);
							if (e.lengthComputable && typeof progress == "function")
								progress.call($button[0], Math.floor(e.loaded / e.total * 100));
						}, false);
					return xhr;
				}})
				.always (function () {
					var xhr = (arguments[1] == "success" ? arguments[2] : arguments[0]);
					var response = (arguments[1] == "success" ? arguments[0] : xhr.responseText);
					if (typeof response == "string")
						try {response = $.parseJSON(response)} catch (e) {}
					if (DEBUG) console.log ("ajaxPress:", xhr.status, xhr.statusText, response);
					$button.prop('disabled', false);
					//if (pressable)
					//	$button.loading(false);
					var errormessage;
					if (xhr.status >= 400 || xhr.status < 200)
						errormessage = (response && typeof response == "object" ? response : xhr.statusText);
					else if (!response || typeof response != "object")
						errormessage = "Sorry, invalid response from server.";
					else
						if (typeof success == "function")
							if (success.call ($button[0], response, xhr) === false)
								errormessage = (typeof error == "string" ? error : "Sorry, response was invalidated.");
					if (errormessage && typeof error == "function")
						error.call($button[0], errormessage, xhr);
				});
			return this;
		},

		'get': function (url, success, error, progress) {
			return this.ajax('GET', url, undefined, success, error, progress);
		},

		'post': function (url, data, success, error, progress) {
			return this.ajax('POST', url, data, success, error, progress);
		},

		'put': function (url, data, success, error, progress) {
			return this.ajax('PUT', url, data, success, error, progress);
		},

		'delete': function (url, success, error, progress) {
			return this.ajax('DELETE', url, undefined, success, error, progress);
		}

	});

}) (window.jQuery || window.Zepto);
