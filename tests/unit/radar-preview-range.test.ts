import {describe,it,expect} from 'vitest';
import {previewByteRange,previewMediaPath} from '../../scripts/lib/radar-local-preview.mjs';
describe('local draft audio byte ranges',()=>{
 it('serves requested chunks and permits seeking to an unbuffered tail',()=>{
  expect(previewByteRange('bytes=0-1023',9000)).toEqual({start:0,end:1023});
  expect(previewByteRange('bytes=8000-',9000)).toEqual({start:8000,end:8999});
  expect(previewByteRange('bytes=8000-9999',9000)).toEqual({start:8000,end:8999});
  expect(previewByteRange('bytes=-1024',9000)).toEqual({start:7976,end:8999});
 });
 it('rejects unsatisfiable offsets without passing them to file streaming',()=>{
  for(const h of ['bytes=9000-','bytes=20-10','bytes=-0'])expect(previewByteRange(h,9000)).toEqual({unsatisfiable:true});
  expect(previewByteRange('bytes=0-',0)).toEqual({unsatisfiable:true});
 });
 it('ignores unsupported syntax and retains the preview access gate',()=>{
  for(const h of [undefined,'bytes=0-1,3-4','items=0-2','bytes=-','bytes=abc'])expect(previewByteRange(h,9000)).toBeNull();
  expect(previewMediaPath('/__radar-preview/audio/daily-ai-radar-2026-10-23.mp3')).toBeNull();
  expect(previewMediaPath('/__radar-preview/audio/../../private.mp3',{enabled:true})).toBeNull();
 });
});
