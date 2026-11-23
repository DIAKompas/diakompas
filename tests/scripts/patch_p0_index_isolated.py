#!/usr/bin/env python3
"""Apply approved P0 text only to a disposable checkout of index.html.
Never run this script against production or commit its output without review.
"""
import json, pathlib, sys, difflib
ROOT=pathlib.Path(__file__).resolve().parents[2]
TARGET=ROOT/'index.html'
FIXTURES=ROOT/'tests/fixtures/plain-language-safety-20261123.json'
LANGS=('cs','sk','en','hu')
def main():
    if '--isolated-ci' not in sys.argv:
        raise SystemExit('BLOCKED: explicit --isolated-ci required; use disposable CI checkout only')
    text=TARGET.read_text(encoding='utf-8')
    original=text
    fixtures=json.loads(FIXTURES.read_text(encoding='utf-8'))
    assert len(fixtures)==4
    decoder=json.JSONDecoder()
    patched=[]
    for fixture in fixtures:
        needle='"id":"'+fixture['id']+'"'
        assert text.count(needle)==1, ('Article not unique',fixture['id'])
        start=text.index(needle)
        opening=text.rfind('{',0,start)
        article,end=decoder.raw_decode(text[opening:])
        assert article['id']==fixture['id']
        assert article['sources']==fixture['sources']
        for lang in LANGS:
            current=article['locales'][lang]
            revised=fixture['locales'][lang]
            assert current['title']==revised['title']
            assert current['lead']==revised['lead']
            assert len(current['sections'])==len(revised['sections'])
            for old,new in zip(current['sections'],revised['sections']):
                assert old[0]==new[0] and new[1].startswith(old[1]), (fixture['id'],lang)
            current['sections']=revised['sections']
        replacement=json.dumps(article,ensure_ascii=False,separators=(',',':'))
        text=text[:opening]+replacement+text[opening+end:]
        patched.append(fixture['id'])
    assert original!=text
    assert len(patched)==4
    TARGET.write_text(text,encoding='utf-8')
    print('PASS: isolated index.html patched; exactly four article JSON objects, all four languages')
    print('NOTE: generated file is CI-only; review all diffs before any commit')
if __name__=='__main__':main()
