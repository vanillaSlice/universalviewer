import BaseCommands = require("../uv-shared-module/BaseCommands");
import Commands = require("../../extensions/uv-seadragon-extension/Commands");
import RightPanel = require("../uv-shared-module/RightPanel");
import PublicationView = require("./PublicationView");
import PageView = require("./PageView");

class ContentRightPanel extends RightPanel {

  $tabs: JQuery;
  $tabsContent: JQuery;
  $publicationButton: JQuery;
  $publicationView: JQuery;
  $pageButton: JQuery;
  $pageView: JQuery;
  $views: JQuery;
  publicationView: PublicationView;
  isPublicationViewOpen: boolean = false;
  pageView: PageView;
  isPageViewOpen: boolean = false;

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

    this.$publicationButton = $('<a class="publication tab" tabindex="0">' + this.content.publication + '</a>');
    this.$publicationButton.prop('title', this.content.publication);
    this.$tabs.append(this.$publicationButton);

    this.$pageButton = $('<a class="page tab" tabindex="0">' + this.content.page + '</a>');
    this.$pageButton.prop('title', this.content.page);
    this.$tabs.append(this.$pageButton);

    this.$tabsContent = $('<div class="tabsContent"></div>');
    this.$main.append(this.$tabsContent);

    this.$views = $('<div class="views"></div>');
    this.$tabsContent.append(this.$views);

    this.$publicationView = $('<div class="publicationView" tabindex="0"></div>');
    this.$views.append(this.$publicationView);

    this.$pageView = $('<div class="pageView" tabindex="0"></div>');
    this.$views.append(this.$pageView);

    this.$publicationButton.onPressed(() => {
      this.openPublicationView();
      $.publish(Commands.OPEN_PUBLICATION_VIEW);
    });

    this.$pageButton.onPressed(() => {
        this.openPageView();
        $.publish(Commands.OPEN_PAGE_VIEW);
    });

    this.setTitle(this.content.title);
  }

  createPublicationView(): void {
    this.publicationView = new PublicationView(this.$publicationView);
  }

  createPageView(): void {
    this.pageView = new PageView(this.$pageView);
  }

  toggleFinish(): void {
    super.toggleFinish();

    if (this.isUnopened) {
      var publicationEnabled: boolean = Utils.Bools.getBool(this.config.options.publicationEnabled, true);
      var pageEnabled: boolean = Utils.Bools.getBool(this.config.options.pageEnabled, true);
      
      // hide the tabs if either publication or page are disabled
      if (!publicationEnabled || !pageEnabled) { 
        this.$tabs.hide();
      }
      
      if (publicationEnabled && this.defaultToPublicationView()) {
        this.openPublicationView();
      } else if (pageEnabled){
        this.openPageView();
      }
    }
  }

  defaultToPublicationView(): boolean {
    return Utils.Bools.getBool(this.config.options.defaultToPublicationEnabled, false);
  }

  expandFullStart(): void {
    super.expandFullStart();
    $.publish(BaseCommands.RIGHTPANEL_EXPAND_FULL_START);
  }

  expandFullFinish(): void {
    super.expandFullFinish();

    if (this.$publicationButton.hasClass('on')) {
        this.openPublicationView();
    } else if (this.$pageButton.hasClass('on')) {
        this.openPageView();
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

  openPublicationView(): void {
    this.isPublicationViewOpen = true;
    this.isPageViewOpen = false;

    if (!this.publicationView) {
      this.createPublicationView();
    }

    this.$publicationButton.addClass('on');
    this.$pageButton.removeClass('on');

    this.publicationView.show();

    if (this.pageView) { 
      this.pageView.hide();
    }

    this.resize();
    this.publicationView.resize();
  }

  openPageView(): void {
    this.isPageViewOpen = true;
    this.isPublicationViewOpen = false;

    if (!this.pageView) {
      this.createPageView();
    }

    this.$pageButton.addClass('on');
    this.$publicationButton.removeClass('on');

    this.pageView.show();

    if (this.publicationView) {
      this.publicationView.hide();
    }

    this.resize();
    this.pageView.resize();
  }

  resize(): void {
    super.resize();

    this.$tabsContent.height(this.$main.height() - (this.$tabs.is(':visible') ? this.$tabs.height() : 0) - this.$tabsContent.verticalPadding());
    this.$views.height(this.$tabsContent.height());
  }

}

export = ContentRightPanel;
