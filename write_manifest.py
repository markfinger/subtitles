import json
import urllib
import urllib2
import time
import os
import pysrt


IP = '60.241.126.167'

manifest = []

# Load in anything that's already been processed
if os.path.exists('star-wars/manifest.json'):
    with open('star-wars/manifest.json', 'r') as manifest_file:
        manifest = json.load(manifest_file)

subs = pysrt.open('star-wars/subs.srt')

# Skip the subs that we've already processed
if manifest:
    subs = subs[len(manifest):]

for i, sub in enumerate(subs):

    url = (
        'https://ajax.googleapis.com/ajax/services/search/images?' +
        'v=1.0&' + urllib.urlencode({'q': sub.text}) + '&userip=' + IP
    )

    request = urllib2.Request(url, None, {'Referer': 'http://github.com'})
    response = urllib2.urlopen(request)
    results = json.load(response)

    images = []
    for result in results.get('responseData', {}).get('results', None):
        if (result.get('unescapedUrl', None)):
            images.append(result['unescapedUrl'])

    manifest.append({
        'text': sub.text,
        'images': images,
        'start': str(sub.start),
        'end': str(sub.end),
    })

    # Dump as we go along, in case it shits itself
    with open('star-wars/manifest.json', 'w') as manifest_file:
        manifest_file.write(
            json.dumps(manifest)
        )

    # Delay between each call to keep the API happy
    time.sleep(4)

    print '%d done, %d to go' % (len(manifest), len(subs) - (i+1))