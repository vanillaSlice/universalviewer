import BaseCommands = require("../uv-shared-module/BaseCommands");
import BaseView = require("../uv-shared-module/BaseView");
import ISeadragonExtension = require('../../extensions/uv-seadragon-extension/ISeadragonExtension');

class PageView extends BaseView {

  isOpen: boolean = false;

  constructor($element: JQuery) {
    super($element, true, true);
  }

  create(): void {
    this.setConfig('contentRightPanel');
    
    super.create();

    $.subscribe(BaseCommands.CANVAS_INDEX_CHANGED, (e, index) => {
      this.databind(index);
    });

    this.databind((<ISeadragonExtension>this.extension).getCanvasIndexParam());
  }

  databind(index: number): void {
    this.$element.empty();
    let indices: number[];
    if ((<ISeadragonExtension>this.extension).isPagingSettingEnabled()) {
      indices = this.extension.getPagedIndices(index);
    } else {
      indices = [index];
    }
    this.appendFullText(indices);
  }

  appendFullText(indices: number[]): void {
    for (let i = 0; i < indices.length; i++) {
      this.$element.append('<p>Full text for page ' + indices[i] + '</p>');
    }
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

export = PageView;
