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
//gs.cookies = document.cookie.split('; ');
/*
 Leaving this ... code behind to remind me that Auth isn't right yet for this content. Still might want to use it here.
 Alternatives are:
 - make this an angular page (ugh!)
 - have a standard FORM which can be loaded (instead of the 401 page)
 */
//gs.service = (function (){
//    var s = {};
//
//    if (window.parent !== window) { // must be a child frame
//        s = window.parent.AuthService;
//    } else {
//        s.getTenant = function () {
//            return document.cookie;
//        }
//    }
//    // console.log('service is',s);
//    // who uses it?
//    return s;
//})();


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
        //var action = $(this).text().toLowerCase(); // or what about the url?
        var $this = $(this);
        var href = $this.attr('href');
        var params = $this.data('params');
        var action = $this.data('action');
        var $tr = activeItem();
        var item = tabInfo($tr);
        var thePath = item.path;
        if (!thePath || thePath === null || thePath === '') {return;}
        var confirmationRequired = $this.data('confirm'); // this could be a question
        if (confirmationRequired) {
            if (!confirm('Are you sure you want to ' + action + ' the file ' + thePath)) {return true;}
        }
        var data = {action: action, path: thePath};

        //console.log('Going to ',action, data.path);
        $tr.find('td:first').html('<i class="fa fa-spinner fa-6"></i>');
        //if (action === 'delete' && !confirm("Are you sure?")) return true;
        //console.log('going to href',href, 'with params', $.param(data));
        location.href = href + '?' + $.param(data);

        //$.get(href, data).then(function (data, textStatus, jqXHR) {
        //    if (jqXHR.getResponseHeader('Location')) {
        //        location.href = jqXHR.getResponseHeader('Location');
        //    }
        //});
        //
    });

    $('.actionitem').on('click',function (e){
        e.preventDefault();
        //var action = $(this).text().toLowerCase(); // or what about the url?
        var $this = $(this);
        var href = $this.attr('href');
        var params = $this.data('params');
        var action = $this.data('action');

        var confirmationRequired = $this.data('confirm'); // this could be a question
        if (confirmationRequired) {
            if (!confirm('Are you sure you want to ' + action + ' the file ' + thePath)) {return true;}
        }
        var data = {action: action};

        console.log('Going to ',action);
        //$tr.find('td:first').html('<i class="fa fa-spinner fa-6"></i>');
        //if (action === 'delete' && !confirm("Are you sure?")) return true;
        //console.log('going to href',href, 'with params', $.param(data));
        location.href = href + '?' + $.param(data);

        //$.get(href, data).then(function (data, textStatus, jqXHR) {
        //    if (jqXHR.getResponseHeader('Location')) {
        //        location.href = jqXHR.getResponseHeader('Location');
        //    }
        //});
        //
    });

    $('#refresh').on('click', function () {
        location.reload();
    });

    var activeItem = function () {
        return $($('.active')[0]);
    };

    var tabInfo = function ($tr) {
        var tab = {};
        tab.href = $tr.data('href');
        tab.title = $tr.data('title');
        tab.type = $tr.data('type');
        tab.path = $tr.data('path');
        //tab.class = $tr.class();
        var params = $tr.data('params');
        if (params) {tab.params = params};
        return tab;
    };

    // default openItem for standalone page
    var openItem = function (tab) { // open in this window
        location.href = tab.href;
    };

    //// all the 'p-needs-selection' buttons should really do a get with their name as action
    //$('unlockItem').on("click",function () {
    //    var data = {action: 'unlock'};
    //    var item = tabInfo(activeItem());
    //    data.path = item.path;
    //    console.log('Going to unlock ', data.path);
    //    $.get(location.pathname, data).then(function (data, textStatus, jqXHR) {
    //        if (jqXHR.getResponseHeader('Location')) {
    //            location.href = jqXHR.getResponseHeader('Location');
    //        }
    //    });
    //});

    // Buttons
    $('#openItem').on('click', function (e) {
        openItem(tabInfo(activeItem()), e.metaKey);
    });

    $('#openItemTab').on('click', function () {
        openItem(tabInfo(activeItem()), true);
    });

    $('#bookmarkItem').on('click', function () {

    });
    //$('#deleteItem').on('click', function () {
    //    var data = {action: 'delete'};
    //    var item = tabInfo(activeItem());
    //    data.path = item.path;
    //    console.log('Going to delete ', data.path);
    //    $.post(location.pathname, data).then(function (data, textStatus, jqXHR) {
    //        if (jqXHR.getResponseHeader('Location')) {
    //            location.href = jqXHR.getResponseHeader('Location');
    //        }
    //    });
    //});

    // The PROBLEM with the row-click action is that it is impossible to do anything else with the row content.
    // For example, a mailto would be nice. Or an expansion triangle to show associated files.
    // row-click actions
    $('tr[data-href]')
        .on('click', function (e) {
            if ($(e.target).is("a")) {return true; } // allow custom actions on cells.
            e.preventDefault();
            $('.active').removeClass('active');
            updateControls();
            $(this).addClass('active');
        })
        .on('dblclick', function (e) {
            e.preventDefault();
            if ($(this).is('locked')) {return false;}
            var tab = tabInfo(activeItem());
            openItem(tabInfo(activeItem()), e.metaKey);
            return false;
        });

    // when in child frame of Pekoe Workspace
    if (gs.scope) { // Can only create a bookmark if this is in an iframe. Can only create a new Pekoe-tab if in Pekoe-workspace
        // override definition

        gs.scope.tab.href = location.href; // Lovely. I could even update the title if I want!

        // Not quite right yet.
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
            $(this).css('outline','solid red 1px');

        }).on('dragover',function(e){
            e.originalEvent.dataTransfer.dropEffect='move';
            e.originalEvent.preventDefault();
        }).on('drop',function(e){
            // now send a move event using the data.
            var data = e.originalEvent.dataTransfer.getData('application/json');
            $(this).css('outline','');
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

