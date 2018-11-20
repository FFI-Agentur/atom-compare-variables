'use babel';

import { CompositeDisposable } from 'atom';

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'compare-variables:fetch': () => this.fetch()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },


  fetch() {
    let editor1 = null;
    let editor2 = null;

    // try to find the first two editors
    let panes = atom.workspace.getPanes();
    for (i = 0; i < panes.length; i++) {
      let activeItem = panes[i].getActiveItem();
      if (atom.workspace.isTextEditor(activeItem)) {
        if (editor1 == null) {
          editor1 = activeItem;
        } else if (editor2 == null) {
          editor2 = activeItem;
        }
      }
    }

    // proceed if two textEditor panes are open
    if (editor1 != null && editor2 != null) {

      let editor1Text = editor1.getText();
      let editor2Text = editor2.getText();

      let varArray1 = editor1Text.match(/\$.*?(?=:)/g);
      let varArray2 = editor2Text.match(/\$.*?(?=:)/g);

      // show difference in both directions
      // let difference = varArray1
      //              .filter(x => varArray2.indexOf(x) == -1)
      //              .concat(varArray2.filter(x => varArray1.indexOf(x) == -1));

      // show difference from left to right
      let differentVars = varArray1.filter(x => varArray2.indexOf(x) == -1);

      if (differentVars.length > 0) {
        editor2.moveToBottom();
        editor2.insertText('\n \n// unused variables \n', {autoIndent: true, select: true});
      }

      for (i = 0; i < differentVars.length; i++) {
        // create RegExp and replace $ with \$
        let re = new RegExp(differentVars[i].replace(/\$/g, "\\\$") + ".*?;");
        let variableLine = editor1Text.match(re);
        editor2.moveToBottom();
        editor2.insertText(variableLine + '\n', {autoIndent: true, select: true});
      }

    }

  }

};
