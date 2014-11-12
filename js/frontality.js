'use strict';

var DEBUG;

/* Collapse & Accordion */

(function ($) {
	$.extend ($.fn, {

		'collapse': function (options) {
			var $element = this;
			if (options == 'toggle') {
				options = (this[0].offsetHeight ? 'hide' : 'show');
			}
			if (options == 'show') {
				this.trigger('show');
				$(this).css('height', this[0].scrollHeight + 'px');
				setTimeout(function () {
					$element.trigger('shown')
				}, 200);
			}
			if (options == 'hide') {
				this.trigger('hide');
				$(this).css('height', '0');
				setTimeout(function () {
					$element.trigger('hidden')
				}, 200);
			}
			return this;
		}

	});

	$(document).ready(function () {
		$('[data-toggle="collapse"][href], [data-toggle="collapse"][data-target]').click(function () {
			$(this.href || $(this).data('target')).collapse('toggle');
		});
		$('[data-toggle="accordion"]').click(function () {
			$(this).siblings('[data-toggle="accordion"]').next('.collapse').collapse('hide');
			$(this).next('.collapse').collapse('toggle');
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

