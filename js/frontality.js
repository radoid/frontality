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
					$element.trigger('shown')
				}, 200);
			}
			if (options == 'hide') {
				$element.removeClass('in').trigger('hide');
				$element.css('height', '0');
				setTimeout(function () {
					$element.trigger('hidden')
				}, 200);
			}
			return this;
		}

	});

	$(document).ready(function () {
		$('[data-toggle="collapse"][href], [data-toggle="collapse"][data-target]').click(function () {
			var $collapse = $(this.href || $(this).data('target')).collapse('toggle');
			if ($collapse.data('parent'))
				$($collapse.data('parent')).find('.collapse.in').not($collapse).collapse('hide');
		});
	});

}) (window.jQuery || window.Zepto || window.$);


/* Modal */

(function ($) {
	$.extend ($.fn, {

		'modal': function (options) {
			var $element = this;
			var $container = this.data('container') || $(
				'<div class="modal-container">' +
					'<div class="modal-backdrop"></div>' +
					'<div class="modal-centered-table">' +
						'<div class="modal-centered-content"></div>' +
					'</div>' +
				'</div>')
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
					$('.modal-centered-content', $container).append(this.css('display', 'inline-block'));
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
		var $modal = $('#modal-generic-dialog').length ? $('#modal-generic-dialog') : $(
			'<div id="modal-generic-dialog" class="modal modal-dialog modal-narrow">' +
				'<h3 class="modal-header">' +
					'<div class="close" data-dismiss="modal">&times;</div>' +
				'</h3>' +
				'<div class="modal-body"></div>' +
				'<div class="modal-footer button-group"></div>' +
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
			$(this.href || $(this).data('target')).modal('show');
		})
	});

}) (window.jQuery || window.Zepto || window.$);


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

}) (window.jQuery || window.Zepto || window.$);
