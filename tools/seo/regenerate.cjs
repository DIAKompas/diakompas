const fs=require('fs'),path=require('path'),cp=require('child_process');
const repo=path.resolve(__dirname,'../..'),work=path.join(__dirname,'work');fs.mkdirSync(work,{recursive:true});fs.copyFileSync(path.join(repo,'index.html'),path.join(work,'index-source.html'));
cp.execFileSync(process.execPath,[path.join(__dirname,'export.cjs'),work],{stdio:'inherit'});
cp.execFileSync('python3',[path.join(__dirname,'build.py')],{stdio:'inherit'});
fs.copyFileSync(path.join(__dirname,'analytics.js'),path.join(work,'site/seo/analytics.js'));
fs.cpSync(path.join(work,'site'),repo,{recursive:true});console.log('Static articles and sitemap regenerated. Review the diff before committing.');
