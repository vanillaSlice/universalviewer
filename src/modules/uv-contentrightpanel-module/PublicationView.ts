import BaseCommands = require("../uv-shared-module/BaseCommands");
import BaseView = require("../uv-shared-module/BaseView");

class PublicationView extends BaseView {

  isOpen: boolean = false;
  component: IIIFComponents.IMetadataComponent;
  $metadata: JQuery;
  limitType: IIIFComponents.MetadataComponentOptions.LimitType;
  limit: number;

  constructor($element: JQuery) {
    super($element, true, true);
  }

  create(): void {
    this.setConfig('contentRightPanel');

    super.create();

    $.subscribe(BaseCommands.CANVAS_INDEX_CHANGED, () => {
      this.databind();
      this.resize();
    });

    $.subscribe(BaseCommands.SETTINGS_CHANGED, () => {
      this.databind();
      this.resize();
    });

    this.$metadata = $('<div class="iiif-metadata-component"></div>');
    this.$element.append(this.$metadata);

    this.component = new IIIFComponents.MetadataComponent(this._getOptions());
  
    this.databind();
  }

  databind(): void {
    this.component.options = this._getOptions();
    this.component.databind();
  }

  private _getOptions(): IIIFComponents.IMetadataComponentOptions {
    return <IIIFComponents.IMetadataComponentOptions>{
        canvasDisplayOrder: this.config.options.canvasDisplayOrder,
        canvases: this.extension.getCurrentCanvases(),
        canvasExclude: this.config.options.canvasExclude,
        canvasLabels: this.extension.getCanvasLabels(this.content.page),
        content: this.config.content,
        copiedMessageDuration: 2000,
        copyToClipboardEnabled: Utils.Bools.getBool(this.config.options.copyToClipboardEnabled, false),
        element: ".rightPanel .iiif-metadata-component",
        helper: this.extension.helper,
        licenseFormatter: null,
        limit: this.config.options.textLimit || 4,
        limitType: IIIFComponents.MetadataComponentOptions.LimitType.LINES,
        manifestDisplayOrder: this.config.options.manifestDisplayOrder,
        manifestExclude: this.config.options.manifestExclude,
        range: this.extension.getCurrentCanvasRange(),
        rtlLanguageCodes: this.config.options.rtlLanguageCodes,
        sanitizer: (html) => {
            return this.extension.sanitize(html);
        },
        showAllLanguages: this.config.options.showAllLanguages
    };
  }

  public show(): void {
    this.isOpen = true;
    this.$element.show();
  }

  public hide(): void {
    this.isOpen = false;
    this.$element.hide();
  }

  resize(): void {
    super.resize();
  }

}

export = PublicationView;
