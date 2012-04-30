/**
 * @name        jQuery Modal
 * @author      Matt Hinchliffe <https://github.com/i-like-robots/jQuery-Modal>
 * @modified    24/04/2012
 * @version     0.8.1
 * @description A simple modal overlay
 *
 * @example jQuery plugin setup
 * var modal_instance = $('body').modal().data('modal');
 *
 * $.ajax({
 *     url: [url],
 *     success: function(data)
 *     {
 *         modal_instance.open(data, callback);
 *     }
 * });
 *
 * @example Generated markup
 * <div class="modal-wrapper">
 *     <div class="modal-content" />
 *     <span class="modal-close" data-toggle="modal">Close</span>
 * </div>
 * <div class="modal-overlay" data-toggle="modal" />
 */

/*jshint trailing:true, smarttabs:true */
; (function($, undefined)
{
	"use strict";

	function Modal(target, options)
	{
		this.opts = $.extend({}, { // Create a new options object for each instance
			onopen:    undefined,
			onclose:   undefined,
			onupdate:  undefined,
			width:     640,
			maxWidth:  '95%',
			height:    480,
			maxHeight: '95%',
			fixed:     false,
			overlay:   true,
			blur:      true,
			escape:    true
		}, options);

		this.target = target;

		return this;
	}

	Modal.prototype = {

		isOpen: false,

		isInitialized: false,

		/**
		 * Instantiate
		 *
		 * @description Create the structure on first run
		 */
		_init: function()
		{
			if (this.isInitialized)
			{
				return;
			}

			this.doc = $(document);

			// Build modal
			this.wrapper = $('<div class="modal-wrapper"><span class="modal-close" data-toggle="modal">Close</span></div>').css({
				position: this.opts.fixed ? 'fixed' : 'absolute',
				width: this.opts.width,
				maxWidth: this.opts.maxWidth,
				height: this.opts.height,
				maxHeight: this.opts.maxHeight,
				display: 'none'
			});
			this.content = $('<div class="modal-content" />').appendTo( this.wrapper );
			this.wrapper.appendTo( this.target );

			// Create overlay
			if (this.opts.overlay)
			{
				this.overlay = $('<div class="modal-overlay"' + (this.opts.blur ? 'data-toggle="modal"' : '') + ' />')
					.css({
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						display: 'none'
					})
					.appendTo( this.target );
			}

			// Context appropriate metrics and events
			this.isBody = (this.target === document.body);
			this.context = this.isBody ? $(window) : $( this.target ).css('position', 'relative');

			this.isInitialized = true;
		},

		/**
		 * Align
		 *
		 * @description Centre modal window and size overlay to fit
		 */
		align: function()
		{
			var height    = this.wrapper.height(),
			    width     = this.wrapper.width(),
			    maxHeight = this.context.height(),
			    maxWidth  = this.context.width(),
			    top       = this.opts.fixed ? 0 : this.context.scrollTop();

			this.wrapper.css(
			{
				top: height < maxHeight ? ( (maxHeight - height ) / 2 ) + top : top,
				left: width < maxWidth ? (maxWidth - width) / 2 : 0
			});

			if (this.opts.overlay)
			{
				this.overlay.css('height', this.isBody ? this.doc.height() : maxHeight );
			}
		},

		/**
		 * Open
		 *
		 * @description Open the modal window
		 * @param {object} content
		 * @param {function} callback
		 */
		open: function(content, callback)
		{
			if ( ! this.isInitialized)
			{
				this._init();
			}
			else if (this.isOpen)
			{
				return;
			}

			var self = this;

			if (this.isBody)
			{
				this.context.on('resize.modal', function()
				{
					self.align();
				});

				this.doc.on('keyup.modal', function(e)
				{
					if ( e.keyCode === 27 )
					{
						self.close();
					}
				});
			}

			this.doc.on('click.modal', '[data-toggle="modal"]', function(e)
			{
				e.preventDefault();
				self.close();
			});

			// Fade in
			this.wrapper
				.add( this.overlay )
				.stop()
				.fadeIn();

			this.isOpen = true;

			// Add content to window
			if (content)
			{
				this.update(content);
			}

			// Callbacks
			if (this.opts.onopen)
			{
				this.opts.onopen.call(this);
			}
			if (callback)
			{
				callback.call(this);
			}
		},

		/**
		 * Update
		 *
		 * @description Change the modal window contents
		 * @param {object} content
		 * @param {function} callback
		 */
		update: function(content, callback)
		{
			this.content.html(content);

			if (this.isOpen)
			{
				this.align();
			}

			// Callbacks
			if (this.opts.onupdate)
			{
				this.opts.onupdate.call(this);
			}
			if (callback)
			{
				callback.call(this);
			}
		},

		/**
		 * Close
		 *
		 * @description Close the modal window and clear contents
		 * @param {function} callback
		 */
		close: function(callback)
		{
			if ( ! this.isInitialized || ! this.isOpen)
			{
				return;
			}

			var self = this;

			// Unbind events
			this.doc.off('.modal');

			// Fade out
			this.wrapper
				.add( this.overlay )
				.stop()
				.fadeOut(function()
				{
					self.content[0].innerHTML = '';
				});

			this.isOpen = false;

			// Callbacks
			if (this.opts.onclose)
			{
				this.opts.onclose.call(this);
			}
			if (callback)
			{
				callback.call(this);
			}
		}
	};

	// jQuery plugin wrapper
	$.fn.modal = function(options)
	{
		return this.each(function()
		{
			if ( ! $.data(this, 'modal') )
			{
				$.data(this, 'modal', new Modal(this, options) );
			}
		});
	};

})(jQuery);