import BaseCommands = require("../uv-shared-module/BaseCommands");
import Commands = require("../../extensions/uv-seadragon-extension/Commands");
import RightPanel = require("../uv-shared-module/RightPanel");
import BibliographicView = require("./BibliographicView");
import TextView = require("./TextView");

class ContentRightPanel extends RightPanel {

  $tabs: JQuery;
  $tabsContent: JQuery;
  $bibliographicButton: JQuery;
  $bibliographicView: JQuery;
  $textButton: JQuery;
  $textView: JQuery;
  $views: JQuery;
  bibliographicView: BibliographicView;
  isBibliographicViewOpen: boolean = false;
  textView: TextView;
  isTextViewOpen: boolean = false;

  constructor($element: JQuery) {
    super($element);
  }

  create(): void {
    this.setConfig('contentRightPanel');

    super.create();

    $.subscribe(BaseCommands.SETTINGS_CHANGED, () => {
      this.resize();
    });

    this.$tabs = $('<div class="tabs"></div>');
    this.$main.append(this.$tabs);

    this.$bibliographicButton = $('<a class="bibliographic tab" tabindex="0">' + this.content.bibliographic + '</a>');
    this.$bibliographicButton.prop('title', this.content.bibliographic);
    this.$tabs.append(this.$bibliographicButton);

    this.$textButton = $('<a class="text tab" tabindex="0">' + this.content.text + '</a>');
    this.$textButton.prop('title', this.content.text);
    this.$tabs.append(this.$textButton);

    this.$tabsContent = $('<div class="tabsContent"></div>');
    this.$main.append(this.$tabsContent);

    this.$views = $('<div class="views"></div>');
    this.$tabsContent.append(this.$views);

    this.$bibliographicView = $('<div class="bibliographicView" tabindex="0"></div>');
    this.$views.append(this.$bibliographicView);

    this.$textView = $('<div class="textView" tabindex="0"></div>');
    this.$views.append(this.$textView);

    this.$bibliographicButton.onPressed(() => {
      this.openBibliographicView();
      $.publish(Commands.OPEN_BIBLIOGRAPHIC_VIEW);
    });

    this.$textButton.onPressed(() => {
        this.openTextView();
        $.publish(Commands.OPEN_TEXT_VIEW);
    });

    this.setTitle(this.content.title);
  }

  createBibliographicView(): void {
    this.bibliographicView = new BibliographicView(this.$bibliographicView);
  }

  createTextView(): void {
    this.textView = new TextView(this.$textView);
  }

  toggleFinish(): void {
    super.toggleFinish();

    if (this.isUnopened) {
      var bibliographicEnabled: boolean = Utils.Bools.getBool(this.config.options.bibliographicEnabled, true);
      var textEnabled: boolean = Utils.Bools.getBool(this.config.options.textEnabled, true);
      
      // hide the tabs if either bibliographic or text are disabled
      if (!bibliographicEnabled || !textEnabled) { 
        this.$tabs.hide();
      }
      
      if (bibliographicEnabled && this.defaultToBibliographicView()) {
        this.openBibliographicView();
      } else if (textEnabled){
        this.openTextView();
      }
    }
  }

  defaultToBibliographicView(): boolean {
    return Utils.Bools.getBool(this.config.options.defaultToBibliographicEnabled, false);
  }

  expandFullStart(): void {
    super.expandFullStart();
    $.publish(BaseCommands.RIGHTPANEL_EXPAND_FULL_START);
  }

  expandFullFinish(): void {
    super.expandFullFinish();

    if (this.$bibliographicButton.hasClass('on')) {
        this.openBibliographicView();
    } else if (this.$textButton.hasClass('on')) {
        this.openTextView();
    }

    $.publish(BaseCommands.RIGHTPANEL_EXPAND_FULL_FINISH);
  }

  collapseFullStart(): void {
    super.collapseFullStart();
    $.publish(BaseCommands.RIGHTPANEL_COLLAPSE_FULL_START);
  }

  collapseFullFinish(): void {
    super.collapseFullFinish();
    $.publish(BaseCommands.RIGHTPANEL_COLLAPSE_FULL_FINISH);
  }

  openBibliographicView(): void {
    this.isBibliographicViewOpen = true;
    this.isTextViewOpen = false;

    if (!this.bibliographicView) {
      this.createBibliographicView();
    }

    this.$bibliographicButton.addClass('on');
    this.$textButton.removeClass('on');

    this.bibliographicView.show();

    if (this.textView) { 
      this.textView.hide();
    }

    this.resize();
    this.bibliographicView.resize();
  }

  openTextView(): void {
    this.isTextViewOpen = true;
    this.isBibliographicViewOpen = false;

    if (!this.textView) {
      this.createTextView();
    }

    this.$textButton.addClass('on');
    this.$bibliographicButton.removeClass('on');

    this.textView.show();

    if (this.bibliographicView) {
      this.bibliographicView.hide();
    }

    this.resize();
    this.textView.resize();
  }

  resize(): void {
    super.resize();

    this.$tabsContent.height(this.$main.height() - (this.$tabs.is(':visible') ? this.$tabs.height() : 0) - this.$tabsContent.verticalPadding());
    this.$views.height(this.$tabsContent.height());
  }

}

export = ContentRightPanel;
