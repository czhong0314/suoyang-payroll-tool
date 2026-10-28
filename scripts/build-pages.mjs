import {cp,mkdir,rm,writeFile} from 'node:fs/promises';
await rm('.pages-build',{recursive:true,force:true});
await mkdir('.pages-build',{recursive:true});
await cp('dist','.pages-build',{recursive:true});
await writeFile('.pages-build/.nojekyll','');
