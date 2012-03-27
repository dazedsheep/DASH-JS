from ebml.schema import EBMLDocument, UnknownElement, CONTAINER, BINARY
 
def fill_video_info(element, offset, video_info):
  if element.name == 'Duration':
    video_info['duration'] = element.value
 
  if element.name == 'DisplayWidth':
    video_info['width'] = element.value
 
  if element.name == 'DisplayHeight':
    video_info['height'] = element.value
 
  if element.name == 'Cluster':
    video_info['clusters'].append({'offset': offset})
 
  if element.name == 'Timecode':
    video_info['clusters'][-1]['timecode'] = element.value
 
  if element.type == CONTAINER:
    for sub_el in element.value:
      fill_video_info(sub_el, offset + element.head_size, video_info)
      offset += sub_el.size
 
if __name__ == '__main__':
  import sys
  import json
  import os
 
  mod_name, _, cls_name = 'ebml.schema.matroska.MatroskaDocument'.rpartition('.')
  try:
    doc_mod = __import__(mod_name, fromlist=[cls_name])
    doc_cls = getattr(doc_mod, cls_name)
  except ImportError:
    parser.error('unable to import module %s' % mod_name)
  except AttributeError:
    parser.error('unable to import class %s from %s' % (cls_name, mod_name))
 
  video_info = {}
  video_info['filename'] = sys.argv[1]
  video_info['total_size'] = os.stat(sys.argv[1]).st_size
  video_info['clusters'] = []
 
  with open(sys.argv[1], 'rb') as stream:
    doc = doc_cls(stream)
    offset = 0
    for el in doc.roots:
      fill_video_info(el, offset, video_info)
      offset += el.size
 
  print json.dumps(video_info)