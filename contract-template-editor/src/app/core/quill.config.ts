import Quill from 'quill';
import * as QuillMention from 'quill-mention';

// Quill.register('modules/mention', QuillMention);
Quill.register('modules/mention', (QuillMention as any).Mention);
