/**
 * @name        Simple modal
 * @author      Matt Hinchliffe
 * @modified    08/03/2012
 * @version     0.6.6
 * @requires    jQuery 1.7+
 * @description A simple modal overlay
 * @example
 * var $modal = $('body').modal().data('modal');
 *
 * $.ajax({
 *     url: [url],
 *     success: function(data)
 *     {
 *         $modal.open(data, callback);
 *     }
 * });
 *
 * @example
 * <div class="modal-wrapper">
 *     <div class="modal-content" />
 *     <span class="modal-close" data-toggle="modal">Close</span>
 * </div>
 * <div class="modal-overlay" data-toggle="modal" />
 */

; (function($, undefined)
{
	"use strict";

	function Modal(target, options)
	{
		this.opts = $.extend({}, {
			onopen:  undefined,
			onclose: undefined,
			onupdate: undefined,
			width:   640,
			height:  480,
			fixed:   true,
			overlay: true
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

			// Build modal
			this.wrapper = $('<div class="modal-wrapper"><span class="modal-close" data-toggle="modal">Close</span></div>').css({
				position: 'absolute',
				width: this.opts.width,
				height: this.opts.height
			});
			this.content = $('<div class="modal-content" />').appendTo( this.wrapper );
			this.wrapper.appendTo( this.target );

			// Create overlay
			if (this.opts.overlay)
			{
				this.overlay = $('<div class="modal-overlay" data-toggle="modal" />')
					.css({
						position: 'absolute',
						top: 0,
						left: 0
					})
					.appendTo( this.target );
			}

			// Bind events and get dimensions from the window if attached to the body
			this.context = this.target.nodeName.toLowerCase() === 'body' ? $(window) : $( this.target ).css('position', 'relative');

			// Only fix the modal if attached to the body
			if (this.opts.fixed)
			{
				this.opts.fixed = $.isWindow(this.context[0]);
			}

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
			    top       = this.context.scrollTop();

			this.wrapper.css(
			{
				top: height < maxHeight ? ( (maxHeight - height ) / 2) + top : top,
				left: width < maxWidth ? ( maxWidth - width ) / 2 : 0
			});

			if (this.opts.overlay)
			{
				this.overlay.css({
					top: top,
					width: maxWidth,
					height: maxHeight
				});
			}
		},

		/**
		 * Open
		 *
		 * @description Populate and open the modal window
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

			if (this.opts.fixed)
			{
				this.context.on('resize.modal scroll.modal', function()
				{
					self.align();
				});
			}

			this.context.on('click.modal', '[data-toggle="modal"]', function(e)
			{
				e.preventDefault();
				self.close();
			});

			// Add content to window
			this.content.html(content);

			// Fade in
			this.wrapper
				.add( this.overlay )
				.stop()
				.fadeIn();

			// Move into position
			this.align();
			this.isOpen = true;

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

				// Callbacks
				if (this.opts.onupdate)
				{
					this.opts.onupdate.call(this);
				}
				if (callback)
				{
					callback.call(this);
				}
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
			this.context.unbind('.modal');

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
			$.data(this, 'modal', new Modal(this, options) );
		});
	};

})(jQuery);