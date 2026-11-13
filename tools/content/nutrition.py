"""Transparent rounded ingredient estimates, not a clinical meal plan.
Values are working assumptions per 100 g (kcal, available carbohydrate, protein).
They are not claimed to be laboratory measurements or a specific branded food.
Actual labels and weighed portions take precedence. Water and pinches omitted.
"""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
values={'egg':[143,0.7,12.6],'tomato':[18,2.7,0.9],'pepper':[31,3.9,1.0],'onion':[40,7.6,1.1],'oil':[884,0,0],'ryeBread':[259,42.5,8.5],'cucumber':[15,3.1,0.7],'lemon':[22,6.6,0.4],'cottage':[98,3.4,11.1],'wholeBread':[247,34.4,12.5],'bulgurDry':[342,63.4,12.3],'chickpeasCooked':[164,19.8,8.9],'parsley':[36,3,3],'aubergine':[25,2.9,1.0],'tahini':[595,11.9,17],'garlic':[149,31,6.4],'wholePita':[262,49,9.8],'couscousDry':[350,65,12],'tofu':[120,1,12],'courgette':[17,2.1,1.2],'carrot':[41,6.8,0.9],'spinach':[23,1.4,2.9],'potato':[77,15.4,2],'cheese':[350,1.5,25],'feta':[264,4.1,14.2],'olives':[145,0.5,1],'broccoli':[34,4,2.8],'whiteBeansCooked':[127,16.3,8.7],'skyr':[63,4,11],'sardinesDrained':[185,0,24],'chia':[486,7.7,16.5],'milk':[46,4.8,3.4],'blueberries':[57,12.1,0.7],'walnuts':[654,7,15.2]}
weights=[{'egg':100,'tomato':200,'pepper':100,'onion':30,'oil':5,'ryeBread':50}, {'tomato':200,'cucumber':100,'pepper':75,'oil':10,'lemon':10,'cottage':100,'wholeBread':30}, {'bulgurDry':40,'chickpeasCooked':80,'tomato':150,'cucumber':80,'parsley':20,'oil':10,'lemon':15}, {'aubergine':200,'tahini':15,'oil':5,'lemon':10,'garlic':3,'wholePita':30}, {'couscousDry':50,'tofu':120,'courgette':100,'carrot':100,'oil':5}, {'egg':100,'spinach':100,'potato':150,'onion':30,'cheese':20,'oil':5}, {'tomato':150,'cucumber':100,'pepper':70,'onion':20,'feta':50,'olives':15,'oil':5,'wholeBread':50}, {'broccoli':200,'whiteBeansCooked':100,'onion':30,'oil':5,'skyr':100,'wholeBread':30}, {'sardinesDrained':80,'ryeBread':60,'tomato':150,'cucumber':50,'lemon':10,'oil':5}, {'skyr':150,'chia':15,'milk':50,'blueberries':80,'walnuts':10}]
recipes=json.loads((root/'content/recipes-20261113.json').read_text())
for r,w in zip(recipes,weights):
 total=[sum(values[k][j]*g/100 for k,g in w.items()) for j in range(3)]
 r.update(dict(zip(['kcal','carbs','protein'],[round(total[0]/5)*5,round(total[1]),round(total[2])])))
(root/'content/recipes-20261113.json').write_text(json.dumps(recipes,ensure_ascii=False,indent=2)+'\n')
(root/'content/nutrition-estimates.json').write_text(json.dumps({'method':__doc__,'per100g':values,'recipeGrams':weights,'assumption':'Two eggs = 100 g edible portion. All recipes are one serving. Cooked/drained weights as listed; grains dry. Values rounded: energy to 5 kcal, carbohydrate/protein to 1 g.'},ensure_ascii=False,indent=2)+'\n')
print([(r['locales']['cs'][0],r['kcal'],r['carbs'],r['protein']) for r in recipes])
