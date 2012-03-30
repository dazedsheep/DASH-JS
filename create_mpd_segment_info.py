#
#Based on python-ebml and the example of Carson McDonald
#
#Created by Benjamin Rainer and Stefan Lederer

previous_offset = 0
video_file = ""
is_first = 0
from ebml.schema import EBMLDocument, UnknownElement, CONTAINER, BINARY
def fill_video_info(element, offset, video_info):
  global previous_offset
  global video_file
  global is_first
  if element.name == 'Duration':
    video_info['duration'] = element.value
 
  if element.name == 'DisplayWidth':
    video_info['width'] = element.value
 
  if element.name == 'DisplayHeight':
    video_info['height'] = element.value
 
  if element.name == 'FileMimeType':
    video_info['mimetype'] = element.value

  if element.name == 'Cluster':
    if is_first == 0:
       video_info['segments'].append('<SegmentBase><Initialization sourceURL=\"' + video_file + '\" range=\"' + str(previous_offset) + "-" + str(offset-1) + '\" /></SegmentBase>')
       video_info['segments'].append('<SegmentList duration=\"' + video_info['segmentduration'] + '\">')
       is_first = is_first + 1
    else:
       video_info['segments'].append('<SegmentURL  media=\"' + video_file + '\" mediaRange=\"' + str(previous_offset) + "-" + str(offset-1) + '\" />')
    

  if element.name == 'Cluster':
    previous_offset = offset

  
  if element.type == CONTAINER:
    for sub_el in element.value:
      fill_video_info(sub_el, offset + element.head_size, video_info)
      offset += sub_el.size
 
if __name__ == '__main__':
  import sys
  import json
  import os
  import xmlrpclib;
  mod_name, _, cls_name = 'ebml.schema.matroska.MatroskaDocument'.rpartition('.')
  try:
    doc_mod = __import__(mod_name, fromlist=[cls_name])
    doc_cls = getattr(doc_mod, cls_name)
  except ImportError:
    parser.error('unable to import module %s' % mod_name)
  except AttributeError:
    parser.error('unable to import class %s from %s' % (cls_name, mod_name))
  global video_file
  video_info = {}
  video_info['filename'] = sys.argv[1]
  video_file = sys.argv[1]
  video_info['mimetype'] = 'video/webm'
  video_info['total_size'] = os.stat(sys.argv[1]).st_size
  video_info['segments'] = []
  video_info['segmentduration'] = sys.argv[2]
  video_info['baseurl'] = sys.argv[4]
  video_info['minBufferTime'] = sys.argv[3]
    
  with open(sys.argv[1], 'rb') as stream:
    doc = doc_cls(stream)
    offset = 0
    for el in doc.roots:
      fill_video_info(el, offset, video_info)
      offset += el.size
  print '<BaseURL>' + video_info['baseurl'] + '</BaseURL>'
  print '<Representation id="XX" codecs="vp8" mimeType=\"'+ video_info['mimetype'] + '\" width=\"'+ str(video_info['width']) + '\" height=\"' + str(video_info['height']) +'\" startWithRAP="true" bandwidth=\"' + str(int((video_info['total_size']*8)/(video_info['duration']/1000))) +'\" minBufferTime=\"' +  video_info['minBufferTime'] + '\">'
  for el in video_info['segments']:
     print el
  print '</SegmentList>'
  print '</Representation>'