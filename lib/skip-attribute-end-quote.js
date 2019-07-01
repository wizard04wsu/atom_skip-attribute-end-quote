'use babel';

import { CompositeDisposable } from 'atom';

function bufferChanged(event){
	let editor = atom.workspace.getActiveTextEditor();
	if(/^text\.(html|xml)(\.|$)/.test(editor.getGrammar().scopeName)){
		let cursors = editor.getCursors();
		for(cursor of cursors){
			if(cursor.isAtBeginningOfLine() || cursor.isAtEndOfLine()) continue;
			let cursorPos = cursor.getBufferPosition(),
				prevPos = cursorPos.translate([0,-1]),
				nextPos = cursorPos.translate([0,1]),
				cursorScopes = cursor.getScopeDescriptor().scopes,
				prevScopes = editor.scopeDescriptorForBufferPosition(prevPos).scopes,
				nextScopes = editor.scopeDescriptorForBufferPosition(nextPos).scopes;
			//if the last character was the closing quote and the next character is identical
			if(prevScopes.length > 3 && nextScopes.length > 2 &&
			 prevScopes[prevScopes.length-3].startsWith("meta.attribute-with-value.") &&
			 prevScopes[prevScopes.length-1].startsWith("punctuation.definition.string.end.") &&
			 cursorScopes[cursorScopes.length-2] === nextScopes[nextScopes.length-2]){	//e.g., "string.quoted.double.html" or "string.quoted.single.html"
				//delete the next quote
				editor.setTextInBufferRange([cursorPos, nextPos], "");
			}
		}
	}
}

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    let subscriptions = this.subscriptions = new CompositeDisposable();
    
    // Add buffer change observers
	subscriptions.add(atom.workspace.observeTextEditors(function (editor){
		subscriptions.add(editor.onDidChange(bufferChanged));
	}));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

};
