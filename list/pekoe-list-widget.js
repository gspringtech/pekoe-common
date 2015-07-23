/*
 * Pekoe Workspace provides a wrapper for the Pekoe Job Manager
 * Copyright (C) 2009,2010,2011-2014 Geordie Springfield Pty Ltd (Australia)
 * Author: Alister Pillow alisterhp@me.com

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var gs;
if (!gs) {
    gs = {};
}


/*
 If the tabService is available, hijack clicks and send the Text and href to the tabService, otherwise allow default.
 If the TARGET is not _self, then load the page in a new tab.
 If the Command/Control key is down, then load the page in a new Tab - regardless of TARGET
 */

$(function () {
    if (window.parent !== window) { // this must be a child frame - not a standalone page
        gs.angular = window.parent.angular;
        gs.scope = gs.angular.element(window.frameElement).scope();
        // gs.scope has access to the functions of the tabs.ctrl.js
        // that gives me access to the tabs!
    } else {
        //console.log('standalone page - anchors behave normally');
    }

    var controlsForSelection = $('.p-needs-selection').attr('disabled', true);
    var updateControls = function () {
        controlsForSelection.removeAttr('disabled');
    };
    // generic menu handler. Each action should be an "a href" with data-action=unlock and possibly data-params=item,item data-confirm=yes
    // I might change GET for POST.
    // each action should return a redirect so that the action can't be repeated.
    $('.menuitem').on('click',function (e){
        e.preventDefault();
	e.stopPropagation();
	console.log('got click');
        // what is the diff between this and the tab approach?
        // I need to have a new tab.
        var $this = $(this);
        var href = $this.attr('href');
        var params = $this.data('params');
        var action = $this.data('action');
        var $tr = activeItem();
        var item = tabInfo($tr);
        var thePath = item.path; // need to decide whether to use PATH or HREF - or both
        if (!thePath || thePath === null || thePath === '') {console.warn('no path'); return;}
        var confirmationRequired = $this.data('confirm'); // this could be a question
        if (confirmationRequired) {
            if (!confirm('Are you sure you want to ' + action + ' the file ' + thePath)) {return true;}
        }
        var data = {action: action, path: thePath};
        $tr.find('td:first').html('<i class="fa fa-spinner fa-6"></i>');
// Things are confused at this point. 

        // I really should be able to construct a tab here and pass this to openItem
        var tab = {};
        tab.href = href + '?' + $.param(data); // /exist/pekoe-app/files.xql?collection=/files/test-jobs
        tab.title = $this.data('title'); // test-jobs
        tab.type = $this.data('type'); // folder
	console.log('tab is ',tab);
        openItem(tab);
        //var param = $tr.data('param');
        //if (param) {tab.param = param};


        //location.href = href + '?' + $.param(data);

    });
// This kind of action doesn't need a selected file path
// but it might need a parameter
// e.g. 'Reports -> pekoe-app/Reports.xql
// New Item -> show Modal
    $('.actionitem').on('click',function (e){
        e.preventDefault();
	e.stopPropagation();
        var $this = $(this);
        var href = $this.attr('href');
        var params = $this.data('params');
        var action = $this.data('action');

        var confirmationRequired = $this.data('confirm'); // this could be a question
        if (confirmationRequired) {
            if (!confirm('Are you sure you want to ' + action)) {return true;} // there is NO PATH !!!
        }

	// will need to add the current collection and any params.
        var data = {action: action};
        location.href = href + '?' + $.param(data);
    });

    /*
    In addition to the .menuitem, i need some way to handle a
     */

    $('#refresh').on('click', function () {
        location.reload();
    });

    var activeItem = function () {
        return $($('.active')[0]);
    };

    var tabInfo = function ($tr) {
        var tab = {};
        tab.href = $tr.data('href'); // /exist/pekoe-app/files.xql?collection=/files/test-jobs
        tab.title = $tr.data('title'); // test-jobs
        tab.type = $tr.data('type'); // folder
        tab.path = $tr.data('path'); // /files/test-jobs
        //tab.class = $tr.class();
        var param = $tr.data('param');
        if (param) {tab.param = param};
        return tab;
    };

    // default openItem for standalone page
    var openItem = function (tab) { // open in this window
        location.href = tab.href;
    };


    // Buttons
    $('#openItem').on('click', function (e) {
	e.stopPropagation();
        openItem(tabInfo(activeItem()), e.metaKey);
    });

    $('#openItemTab').on('click', function (e) {
	e.stopPropagation();
        openItem(tabInfo(activeItem()), true);
    });


    $('#bookmarkItem').on('click', function () {

    });

    // buttons with class pekoeTabButton and data-href, data-type, data-title (e.g. New Booking)
    $('.pekoeTabButton').on('click', function (e) {
	e.stopPropagation();
        openItem(tabInfo($(this)));
    });

    // allow the user to deselect
    $('html').on('click', function (e) {
	if (e.target.nodename !== 'html') return true;
	$('.active').removeClass('active');
    });
    // The PROBLEM with the row-click action is that it is impossible to do anything else with the row content.
    // For example, a mailto would be nice. Or an expansion triangle to show associated files.
    // row-click actions
    $('tr[data-href]')
        .on('click', function (e) {
            if ($(e.target).is("a")) {return true; } // allow custom actions on cells.
            e.preventDefault();
	    e.stopPropagation();
            $('.active').removeClass('active');
            updateControls();
            $(this).addClass('active');
        })
        .on('dblclick', function (e) {
            e.preventDefault();
            var $active = activeItem();
            // TODO write a HEAD request that checks the file before attempting to open it.
            if ($active.is('.locked')) {return false;}
            if ($active.is('.locked-by-me')) {console.log('You have already opened this file.');}

            //if ($(this).is('locked')) {return false;}
            var tab = tabInfo(activeItem());
            openItem(tab, e.metaKey);
            return false;
        });

    // when in child frame of Pekoe Workspace
    if (gs.scope) { // Can only create a bookmark if this is in an iframe. Can only create a new Pekoe-tab if in Pekoe-workspace
        // override definition

        gs.scope.tab.href = location.href; // Lovely. I could even update the title if I want!

        // If the tab-type is the same as the current, then open in this tab.
        // e.g. if this is a folder, then open in a folder.
        var openItem = function (tab, inNewTab) {

            if (tab.type === 'form' || inNewTab) {
                gs.scope.addTab(tab); //
            } else if (tab.type === 'other' && tab.href.indexOf('odt:') == 0) { // TODO ------------ tidy up...
                location.href = tab.href.split(":")[1];
            } else if (tab.type === 'other' && tab.href.indexOf('docx:') == 0) {
                location.href = tab.href.split(":")[1];
            } else if (tab.type === 'other') {
                tab.type = 'report';
                gs.scope.addTab(tab);
            }
             else {
                location.href = tab.href;
            }
        };

        $('tr.collection').on('dragenter',function(e){
            e.preventDefault();
            $(this).css('outline','solid red 2px');

        }).on('dragover',function(e){
            e.originalEvent.dataTransfer.dropEffect='move';
            e.originalEvent.preventDefault();
        }).on('drop',function(e){
            // now send a move event using the data.
            var $this = $(this);
            $this.css('outline','');
            if (!$this.hasClass('collection')) { // dummy check
                console.log('Target is not a collection');
                return;
            }
            var jsondata = e.originalEvent.dataTransfer.getData('application/json');
            var data = JSON.parse(jsondata);



            var resource = data.path;
            var target = $this.data('path');

            console.log('dropped',data,'to move',resource,  'into',target);

            if (!confirm('Are you sure you want to move ' + resource + ' into folder ' + target )) {return true;}

            var pathdata = {action: 'move', collection: target, resource: resource};

            location.href = '/exist/pekoe-app/manage-files.xql?' + $.param(pathdata);

        }).on('dragleave',function () {
            $(this).css('outline','');
        });

        /*
         function onDrop(event)
         {
         var data = event.dataTransfer.getData("text/plain");
         event.target.textContent = data;
         event.preventDefault();
         }
         */


        // NOTE: this is the HTML5 Drag and Drop API, NOT jQueryUI
        $('*[data-href]')
            .attr('draggable', true).on('dragstart', function (ev) {
                ev.originalEvent.dataTransfer.effectAllowed="move";
                ev.originalEvent.dataTransfer.setData('application/json', gs.angular.toJson(tabInfo($(ev.target)))); // Lovely - it works. Drag to Bookmarks in main frame.
            });
    }

});

