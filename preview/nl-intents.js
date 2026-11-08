(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DiaKompasNL=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const DATA={
  "copy": {
    "alcohol": {
      "cs": "Alkohol může způsobit i opožděnou hypoglykemii, zejména při inzulinu či některých dalších lécích a bez dostatku jídla. Může zakrýt její příznaky. Slazený nápoj může glykemii nejprve zvýšit; to neodstraňuje pozdější riziko poklesu.",
      "sk": "Alkohol môže spôsobiť aj oneskorenú hypoglykémiu, najmä pri inzulíne či niektorých ďalších liekoch a nedostatku jedla. Môže zakryť príznaky. Sladený nápoj môže najprv glykémiu zvýšiť; neskorší pokles tým nie je vylúčený.",
      "en": "Alcohol can cause delayed hypoglycaemia, especially with insulin or some other medicines and insufficient food. It can hide warning symptoms. A sugary drink can initially raise glucose; this does not remove the later risk of a low.",
      "hu": "Az alkohol késői hipoglikémiát is okozhat, különösen inzulin vagy bizonyos gyógyszerek és elégtelen étkezés mellett. Elfedi a figyelmeztető tüneteket. A cukros ital először emelheti a vércukrot; ettől a későbbi csökkenés veszélye megmarad."
    },
    "general": {
      "cs": "Účinek závisí na konkrétní látce; všechny drogy cukr stejně neovlivňují. Změny úsudku, jídla, pohybu nebo vynechání léčby mohou rozkolísat glykemii a zakrýt hypoglykemii. Výzkum přímých účinků je omezený. Kterou látku máte na mysli?",
      "sk": "Účinok závisí od látky; všetky drogy cukor rovnako neovplyvňujú. Zmeny úsudku, jedla, pohybu alebo vynechanie liečby môžu rozkolísať glykémiu a zakryť hypoglykémiu. Výskum priamych účinkov je obmedzený. Ktorú látku myslíte?",
      "en": "Effects depend on the substance; drugs do not all affect glucose alike. Changes in judgement, meals, activity or missed treatment can disrupt glucose management and hide hypoglycaemia. Research into direct effects is limited. Which substance do you mean?",
      "hu": "A hatás az anyagtól függ; nem minden drog változtatja egyformán a vércukrot. Az ítélőképesség, étkezés, mozgás vagy kezelés kihagyása befolyásolhatja azt, és elfedheti a hipoglikémiát. A közvetlen hatások kutatása korlátozott. Melyik anyagra gondol?"
    },
    "cannabis": {
      "cs": "THC může zhoršit pozornost, paměť a úsudek. U diabetu jsou důležitá i nepřímá rizika změn jídla a zanedbání léčby. Jednotný přímý vzestup či pokles glykemie nelze spolehlivě předpovědět. Konopí není náhradou léčby diabetu.",
      "sk": "THC môže zhoršiť pozornosť, pamäť a úsudok. Pri diabete sú dôležité aj nepriame riziká zmien jedla a zanedbania liečby. Jednotný priamy vzostup či pokles glykémie nemožno spoľahlivo predpovedať. Konopa nenahrádza liečbu diabetu.",
      "en": "THC can impair attention, memory and judgement. With diabetes, changes in eating and missed care also matter. A consistent direct rise or fall in glucose cannot reliably be predicted. Cannabis is not a replacement for diabetes treatment.",
      "hu": "A THC ronthatja a figyelmet, memóriát és ítélőképességet. Cukorbetegségben az étkezés változása és a kezelés elmaradása is számít. Egységes közvetlen vércukoremelkedés vagy csökkenés nem jósolható meg megbízhatóan. A kannabisz nem helyettesíti a kezelést."
    },
    "cbd": {
      "cs": "CBD není totéž co THC. Může ovlivnit jiné léky, způsobit ospalost či změny chuti k jídlu. Spolehlivý účinek CBD ke snížení glykemie zde není doložen. Konkrétní přípravek a možné interakce proberte s lékárníkem nebo lékařem.",
      "sk": "CBD nie je to isté ako THC. Môže ovplyvniť iné lieky, spôsobiť ospalosť či zmeny chuti do jedla. Spoľahlivé zníženie glykémie CBD tu nie je doložené. Prípravok a interakcie preberte s lekárnikom alebo lekárom.",
      "en": "CBD is different from THC. It can interact with medicines and cause drowsiness or appetite changes. A reliable glucose-lowering benefit is not established here. Discuss the particular product and interactions with a pharmacist or clinician.",
      "hu": "A CBD nem azonos a THC-val. Kölcsönhatásba léphet gyógyszerekkel, álmosságot vagy étvágyváltozást okozhat. Megbízható vércukorcsökkentő előny itt nem igazolt. A konkrét készítményt és kölcsönhatásokat beszélje meg gyógyszerésszel vagy orvossal."
    },
    "stimulant": {
      "cs": "Stimulanty mohou zvyšovat tvorbu glukózy a zhoršit její využití; u diabetu 1. typu tím může růst riziko ketoacidózy. Nejde o předpověď konkrétní hodnoty. Jídlo, aktivita a vynechání léčby mohou výsledek dále změnit.",
      "sk": "Stimulanty môžu zvýšiť tvorbu glukózy a zhoršiť jej využitie; pri diabete 1. typu tým môže rásť riziko ketoacidózy. Nejde o predpoveď konkrétnej hodnoty. Jedlo, aktivita a vynechanie liečby môžu výsledok ďalej meniť.",
      "en": "Stimulants can increase glucose production and impair clearance, increasing ketoacidosis risk in type 1 diabetes. This does not predict an individual reading. Food, activity and missed treatment can further change the outcome.",
      "hu": "A stimulánsok fokozhatják a glükóztermelést és ronthatják annak felhasználását, növelve a ketoacidózis kockázatát 1-es típusú cukorbetegségben. Ez nem egyéni vércukor-előrejelzés. Az étkezés, mozgás és kihagyott kezelés tovább módosíthatja a hatást."
    },
    "mdma": {
      "cs": "MDMA může způsobit přehřátí a dehydrataci; nebezpečná může být i porucha rovnováhy vody a solí. Při diabetu se přidávají rizika změn aktivity a péče o glykemii. Nelze slíbit jednotný směr změny cukru.",
      "sk": "MDMA môže spôsobiť prehriatie a dehydratáciu; nebezpečná je aj porucha rovnováhy vody a solí. Pri diabete sa pridávajú riziká zmien aktivity a starostlivosti o glykémiu. Jednotný smer zmeny cukru nemožno sľúbiť.",
      "en": "MDMA can cause overheating and dehydration; disturbed water and salt balance is also dangerous. With diabetes, altered activity and glucose self-care add risks. A uniform direction of glucose change cannot be promised.",
      "hu": "Az MDMA túlmelegedést, kiszáradást és veszélyes víz-só egyensúlyzavart okozhat. Cukorbetegségben a megváltozott aktivitás és önellátás további kockázat. Nem ígérhető egységes irányú vércukorváltozás."
    },
    "opioid": {
      "cs": "Opioidy mohou tlumit vědomí a dýchání; předávkování může být smrtelné. Útlum komplikuje péči o diabetes. Jednotný přímý vliv na glykemii zde není doložen. Alkohol, benzodiazepiny a další sedativa riziko předávkování zvyšují.",
      "sk": "Opioidy môžu tlmiť vedomie a dýchanie; predávkovanie môže byť smrteľné. Útlm komplikuje starostlivosť o diabetes. Jednotný priamy účinok na glykémiu tu nie je doložený. Alkohol, benzodiazepíny a ďalšie sedatíva zvyšujú riziko predávkovania.",
      "en": "Opioids can suppress consciousness and breathing; overdose can be fatal. Sedation complicates diabetes self-care. A uniform direct glucose effect is not established here. Alcohol, benzodiazepines and other sedatives increase overdose risk.",
      "hu": "Az opioidok csökkenthetik az éberséget és a légzést; a túladagolás halálos lehet. A bódultság nehezíti a cukorbetegség önellátását. Egységes közvetlen vércukorhatás itt nem igazolt. Az alkohol, benzodiazepinek és más nyugtatók növelik a túladagolás kockázatát."
    },
    "sedative": {
      "cs": "Sedativa, například diazepam, mohou způsobit ospalost a sníženou bdělost. To může ztížit reakci na varovné příznaky; nepovažujte možné projevy hypoglykemie automaticky za útlum lékem. Jednotný přímý vliv na cukr nelze předpokládat. Předepsanou léčbu sami neměňte.",
      "sk": "Sedatíva, napríklad diazepam, môžu spôsobiť ospalosť a zníženú bdelosť. Reakcia na varovné príznaky môže byť ťažšia; možnú hypoglykémiu nezamieňajte automaticky za útlm liekom. Jednotný priamy účinok na cukor nemožno predpokladať. Liečbu sami nemeňte.",
      "en": "Sedatives such as diazepam can cause sleepiness and reduced alertness. Responding to warning signs can be harder; do not automatically attribute possible hypoglycaemia to sedation. A uniform direct glucose effect cannot be assumed. Do not change prescribed treatment yourself.",
      "hu": "A nyugtatók, például a diazepam álmosságot és csökkent éberséget okozhatnak. Nehezebb lehet reagálni a figyelmeztető jelekre; a lehetséges hipoglikémiát ne tekintse automatikusan gyógyszeres bódultságnak. Egységes közvetlen vércukorhatás nem feltételezhető. Kezelésén önállóan ne változtasson."
    },
    "nicotine": {
      "cs": "Nikotin může zvyšovat glykemii. Kouření zhoršuje zvládání diabetu a zvyšuje riziko jeho komplikací; není bezpečným způsobem ovlivňování cukru. Změny léčby při odvykání řešte se zdravotnickým týmem, nikoli výpočtem dávky v tomto průvodci.",
      "sk": "Nikotín môže zvyšovať glykémiu. Fajčenie sťažuje zvládanie diabetu a zvyšuje riziko komplikácií; nie je bezpečným spôsobom ovplyvňovania cukru. Zmeny liečby pri odvykaní riešte so zdravotníckym tímom, nie výpočtom dávky v sprievodcovi.",
      "en": "Nicotine can raise glucose. Smoking makes diabetes harder to manage and increases complications; it is not a safe glucose-control method. Discuss treatment changes during quitting with your care team rather than calculating doses in this guide.",
      "hu": "A nikotin emelheti a vércukrot. A dohányzás nehezíti a cukorbetegség kezelését és növeli a szövődmények kockázatát; nem biztonságos vércukorszabályozó módszer. Leszokáskor a kezelés változtatását a gondozócsapattal egyeztesse, ne itt számoljon adagot."
    },
    "vaping": {
      "cs": "Vaping může obsahovat nikotin, který zvyšuje glykemii. Ani aerosol bez nikotinu není neškodný. Účinek konkrétního výrobku na glykemii nelze spolehlivě předpovědět a důkazy mají omezení. Vaping není léčba diabetu.",
      "sk": "Vaping môže obsahovať nikotín, ktorý zvyšuje glykémiu. Ani aerosól bez nikotínu nie je neškodný. Účinok konkrétneho výrobku na glykémiu nemožno spoľahlivo predpovedať; dôkazy majú obmedzenia. Vaping nelieči diabetes.",
      "en": "Vapes may contain nicotine, which raises glucose. Nicotine-free aerosol is not harmless either. The glucose effect of an individual product cannot reliably be predicted, and evidence has limitations. Vaping is not diabetes treatment.",
      "hu": "A vape nikotint tartalmazhat, amely emeli a vércukrot. A nikotinmentes aeroszol sem ártalmatlan. Egy konkrét termék vércukorhatása nem jósolható meg megbízhatóan; a bizonyítékok korlátozottak. A vaping nem cukorbetegség-kezelés."
    },
    "mix": {
      "cs": "Kombinace může mít nepředvídatelné účinky. Alkohol s opioidy či benzodiazepiny zvlášť zvyšuje riziko útlumu dýchání a předávkování; stimulant útlum bezpečně nevyruší. U diabetu navíc může být obtížnější rozpoznat hypoglykemii. Návod ke kombinování neposkytuji.",
      "sk": "Kombinácia môže mať nepredvídateľné účinky. Alkohol s opioidmi či benzodiazepínmi zvyšuje riziko útlmu dýchania a predávkovania; stimulant ho bezpečne nevyruší. Pri diabete môže byť ťažšie rozpoznať hypoglykémiu. Návod na kombinovanie neposkytujem.",
      "en": "Combinations can be unpredictable. Alcohol with opioids or benzodiazepines particularly increases breathing-suppression and overdose risk; a stimulant does not safely cancel sedation. Diabetes adds the problem of recognising hypoglycaemia. I do not provide mixing instructions.",
      "hu": "A kombinációk kiszámíthatatlanok. Az alkohol opioidokkal vagy benzodiazepinekkel különösen növeli a légzésdepresszió és túladagolás kockázatát; a stimuláns nem semlegesíti biztonságosan a bódultságot. Cukorbetegségben a hipoglikémia felismerése is nehezebb lehet. Keverési útmutatót nem adok."
    },
    "type": {
      "cs": "U diabetu 1. typu může vynechání inzulinu vést ke ketoacidóze. U diabetu 2. typu záleží i na léčbě; inzulin a některé další léky mohou způsobit hypoglykemii. Žádná z těchto látek nenahrazuje léčbu.",
      "sk": "Pri diabete 1. typu môže vynechanie inzulínu viesť ku ketoacidóze. Pri 2. type záleží aj na liečbe; inzulín a niektoré ďalšie lieky môžu spôsobiť hypoglykémiu. Tieto látky liečbu nenahrádzajú.",
      "en": "Missing insulin in type 1 diabetes can cause ketoacidosis. In type 2 diabetes, treatment matters too: insulin and some other medicines can cause hypoglycaemia. These substances do not replace treatment.",
      "hu": "1-es típusú cukorbetegségben az inzulin kihagyása ketoacidózist okozhat. 2-es típusban a kezelés is számít: az inzulin és bizonyos gyógyszerek hipoglikémiát okozhatnak. Ezek az anyagok nem helyettesítik a kezelést."
    },
    "hypo": {
      "cs": "Třes nebo pocení po látce nemusí být jen intoxikace; může jít o hypoglykemii. Při diabetu ověřte glykemii a řiďte se plánem pro hypoglykemii. Při poruše vědomí či nemožnosti polykat volejte 155/112 a nic nepodávejte ústy.",
      "sk": "Tras či potenie po látke nemusí byť len intoxikácia; môže ísť o hypoglykémiu. Pri diabete overte glykémiu a postupujte podľa plánu pre hypoglykémiu. Pri poruche vedomia či nemožnosti prehĺtať volajte 155/112 a nič nepodávajte ústami.",
      "en": "Shaking or sweating after a substance may be hypoglycaemia, not just intoxication. With diabetes, check glucose and follow your hypoglycaemia plan. If consciousness or swallowing is impaired, call 112 and give nothing by mouth.",
      "hu": "Az anyag utáni remegés vagy izzadás hipoglikémia is lehet, nem csak intoxikáció. Cukorbetegségben ellenőrizze a vércukrot, és kövesse hipoglikémia-tervét. Tudatzavar vagy nyelési képtelenség esetén hívja a 112-t; szájon át semmit ne adjon."
    },
    "urgent": {
      "cs": "Možné akutní ohrožení: ihned volejte 155 nebo 112. Nečekejte na chat. Člověku s poruchou vědomí nic nepodávejte ústy. Kontrolujte dýchání a řiďte se operátorem; při nenormálním dýchání zahajte resuscitaci podle jeho pokynů.",
      "sk": "Možné akútne ohrozenie: ihneď volajte 155 alebo 112. Nečakajte na chat. Pri poruche vedomia nič nepodávajte ústami. Kontrolujte dýchanie a riaďte sa operátorom; pri nenormálnom dýchaní začnite resuscitáciu podľa jeho pokynov.",
      "en": "Possible medical emergency: call 112 now. Do not wait for this chat. Give nothing by mouth to someone with impaired consciousness. Check breathing and follow the dispatcher; start resuscitation as directed if breathing is abnormal.",
      "hu": "Lehetséges sürgősségi állapot: azonnal hívja a 112-t. Ne várjon a chatre. Tudatzavar esetén szájon át semmit ne adjon. Ellenőrizze a légzést, kövesse a mentésirányítót; rendellenes légzésnél utasítása szerint kezdje az újraélesztést."
    },
    "refuse": {
      "cs": "Individuální dávku inzulinu ani jiných léků zde neurčuji. Návod k užití, kombinování či zesílení účinku látek neposkytuji. Mohu vysvětlit zdravotní rizika; léčbu řešte se zdravotnickým týmem.",
      "sk": "Individuálnu dávku inzulínu ani iných liekov tu neurčujem. Návod na užitie, kombinovanie či zosilnenie účinku látok neposkytujem. Môžem vysvetliť zdravotné riziká; liečbu riešte so zdravotníckym tímom.",
      "en": "I cannot determine individual insulin or medicine doses or provide instructions for taking, mixing or enhancing substances. I can explain health risks; discuss treatment with your care team.",
      "hu": "Egyéni inzulin- vagy gyógyszeradagot nem határozok meg, és nem adok útmutatót anyagok használatához, keveréséhez vagy hatásuk fokozásához. Az egészségügyi kockázatokat elmagyarázhatom; kezelését a gondozócsapattal egyeztesse."
    },
    "clarify": {
      "cs": "Upřesníte, kterou látku máte na mysli a zda se ptáte obecně, nebo máte nyní potíže? Slangový výraz může mít více významů.",
      "sk": "Spresníte látku a či sa pýtate všeobecne alebo máte teraz ťažkosti? Slang môže mať viac významov.",
      "en": "Which substance do you mean, and is this a general question or are you having symptoms now? Slang can have several meanings.",
      "hu": "Melyik anyagra gondol, és általánosan kérdez, vagy most vannak panaszai? A szleng többértelmű lehet."
    },
    "after": {
      "cs": "Po samotném popisu nelze určit intoxikaci ani vaši glykemii. Při diabetu ji ověřte podle svého plánu; léčbu sami neměňte. Při nových či zhoršujících se obtížích vyhledejte zdravotní pomoc.",
      "sk": "Z opisu nemožno určiť intoxikáciu ani glykémiu. Pri diabete ju overte podľa plánu; liečbu sami nemeňte. Pri nových či zhoršujúcich sa ťažkostiach vyhľadajte pomoc.",
      "en": "A description alone cannot determine intoxication or your glucose. With diabetes, check it according to your plan; do not change treatment yourself. Seek medical help for new or worsening symptoms.",
      "hu": "A leírásból nem állapítható meg intoxikáció vagy vércukorérték. Cukorbetegségben terve szerint ellenőrizze; kezelésén önállóan ne változtasson. Új vagy romló panasz esetén kérjen orvosi segítséget."
    }
  },
  "sources": {
    "alcohol": [
      "NIDDK — Low Blood Glucose",
      "https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/low-blood-glucose-hypoglycemia"
    ],
    "general": [
      "Diabetes UK — Recreational drugs and diabetes",
      "https://www.diabetes.org.uk/living-with-diabetes/life-with-diabetes/young-adults/drugs"
    ],
    "cannabis": [
      "CDC — Cannabis and Brain Health",
      "https://www.cdc.gov/cannabis/health-effects/brain-health.html"
    ],
    "cbd": [
      "CDC — About CBD",
      "https://www.cdc.gov/cannabis/about/about-cbd.html"
    ],
    "stimulant": [
      "ADA/EASD — Type 1 diabetes consensus, 2021",
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC8481000/"
    ],
    "mdma": [
      "NHS inform — MDMA",
      "https://www.nhsinform.scot/healthy-living/drugs-and-drug-use/common-drugs/mdma-ecstasy/"
    ],
    "opioid": [
      "CDC — Prescription Opioids",
      "https://www.cdc.gov/overdose-prevention/about/prescription-opioids.html"
    ],
    "sedative": [
      "NHS — Diazepam",
      "https://www.nhs.uk/medicines/diazepam/"
    ],
    "nicotine": [
      "CDC — Diabetes and Smoking",
      "https://www.cdc.gov/diabetes/risk-factors/diabetes-and-smoking.html"
    ],
    "vaping": [
      "CDC — Health Effects of Vaping",
      "https://www.cdc.gov/tobacco/e-cigarettes/health-effects.html"
    ],
    "mix": [
      "CDC — Polysubstance Use",
      "https://www.cdc.gov/stop-overdose/caring/polysubstance-use.html"
    ],
    "urgent": [
      "NHS — Poisoning",
      "https://www.nhs.uk/conditions/poisoning/"
    ],
    "hypo": [
      "NHS — Hypoglycaemia",
      "https://www.nhs.uk/conditions/low-blood-sugar-hypoglycaemia/"
    ],
    "dka": [
      "CDC — Diabetic Ketoacidosis",
      "https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html"
    ]
  },
  "labels": {
    "cs": {
      "heading": "Látky a diabetes",
      "sources": "Odborné zdroje (EN)",
      "note": "Obecné vzdělávací informace, nikoli diagnóza nebo dávkování.",
      "follow": [
        "A co když mám diabetes 1. typu?",
        "Mohu přehlédnout nízký cukr?"
      ],
      "names": {
        "alcohol": "Alkohol",
        "cannabis": "Konopí / THC",
        "cbd": "CBD",
        "amphetamine": "Amfetamin",
        "methamphetamine": "Metamfetamin / pervitin",
        "cocaine": "Kokain",
        "mdma": "MDMA / extáze",
        "opioid": "Opioidy",
        "sedative": "Sedativa / benzodiazepiny",
        "nicotine": "Nikotin / kouření",
        "vaping": "Vaping",
        "mix": "Kombinace látek",
        "general": "Psychoaktivní látky",
        "clarify": "Upřesnění dotazu",
        "urgent": "Akutní pomoc",
        "hypo": "Možná hypoglykemie",
        "refuse": "Bezpečnostní hranice"
      }
    },
    "sk": {
      "heading": "Látky a diabetes",
      "sources": "Odborné zdroje (EN)",
      "note": "Všeobecné informácie, nie diagnóza ani dávkovanie.",
      "follow": [
        "A čo keď mám diabetes 1. typu?",
        "Môžem prehliadnuť nízky cukor?"
      ],
      "names": {
        "alcohol": "Alkohol",
        "cannabis": "Konopa / THC",
        "cbd": "CBD",
        "amphetamine": "Amfetamín",
        "methamphetamine": "Metamfetamín / pervitín",
        "cocaine": "Kokaín",
        "mdma": "MDMA / extáza",
        "opioid": "Opioidy",
        "sedative": "Sedatíva / benzodiazepíny",
        "nicotine": "Nikotín / fajčenie",
        "vaping": "Vaping",
        "mix": "Kombinácie látok",
        "general": "Psychoaktívne látky",
        "clarify": "Spresnenie otázky",
        "urgent": "Akútna pomoc",
        "hypo": "Možná hypoglykémia",
        "refuse": "Bezpečnostné hranice"
      }
    },
    "en": {
      "heading": "Substances and diabetes",
      "sources": "Clinical sources (EN)",
      "note": "General education, not a diagnosis or dosing advice.",
      "follow": [
        "What if I have type 1 diabetes?",
        "Could I miss low blood sugar?"
      ],
      "names": {
        "alcohol": "Alcohol",
        "cannabis": "Cannabis / THC",
        "cbd": "CBD",
        "amphetamine": "Amphetamine",
        "methamphetamine": "Methamphetamine",
        "cocaine": "Cocaine",
        "mdma": "MDMA / ecstasy",
        "opioid": "Opioids",
        "sedative": "Sedatives / benzodiazepines",
        "nicotine": "Nicotine / smoking",
        "vaping": "Vaping",
        "mix": "Substance combinations",
        "general": "Psychoactive substances",
        "clarify": "Clarification",
        "urgent": "Emergency help",
        "hypo": "Possible hypoglycaemia",
        "refuse": "Safety boundary"
      }
    },
    "hu": {
      "heading": "Szerek és cukorbetegség",
      "sources": "Szakmai források (EN)",
      "note": "Általános tájékoztatás, nem diagnózis vagy adagolási tanács.",
      "follow": [
        "És ha 1-es típusú cukorbeteg vagyok?",
        "Észrevétlen maradhat az alacsony vércukor?"
      ],
      "names": {
        "alcohol": "Alkohol",
        "cannabis": "Kannabisz / THC",
        "cbd": "CBD",
        "amphetamine": "Amfetamin",
        "methamphetamine": "Metamfetamin",
        "cocaine": "Kokain",
        "mdma": "MDMA / ecstasy",
        "opioid": "Opioidok",
        "sedative": "Nyugtatók / benzodiazepinek",
        "nicotine": "Nikotin / dohányzás",
        "vaping": "Vaping",
        "mix": "Szerek kombinációi",
        "general": "Pszichoaktív szerek",
        "clarify": "Pontosítás",
        "urgent": "Sürgős segítség",
        "hypo": "Lehetséges hipoglikémia",
        "refuse": "Biztonsági határ"
      }
    }
  }
};
function normalize(q){return String(q||'').toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\bcuker\b/g,'cukr').replace(/\balkohl\b/g,'alkohol').replace(/\bmarihuna\b/g,'marihuana').replace(/\bkokainu?\b/g,'kokain').replace(/\bpervityn\b/g,'pervitin');}
function isMood(q){const n=normalize(q);return /(nalad|podrazd|nervoz|mood|irritab|hangulat|ingerlekeny)/.test(n)&&/(cuk[rueo]|glykem|glukoz|sugar|glucose|vercuk|diabet)/.test(n);}
const groups=[
 ['cbd',/\bcbd\b|cannabidiol|kanabidiol/],
 ['vaping',/vap(?:ing|e|ovat|oval)|elektronick\w* cigaret|e cigaret|e cigi|elektromos cig/],
 ['mdma',/\bmdma\b|extaz|extas|ecstas|eksztaz|\bmolly\b/],
 ['methamphetamine',/metamfet|methamphet|pervit|\bmeth\b|\bpiko\b|\bcrystal meth\b/],
 ['amphetamine',/amfet|amphet|\bspeed\b/],
 ['cocaine',/kokain|cocain|\bcoke\b|\bkoks\b/],
 ['opioid',/opioid|opiat|heroin|fentanyl|fentanil|morphin|morfin|oxycodon|metadon|methadon/],
 ['sedative',/benzodiazep|sedativ|sedati|diazep|alprazol|xanax|neurol|rivotril|lexaurin|valium|lek\w* na uklidnen|liek\w* na upokoj|tranquili|nyugtato|altato|calming medic/],
 ['cannabis',/konop|cannab|kannab|marihuan|marijuan|mariuhan|\bthc\b|\bweed\b|ganja|gandza|huleni|\bfu\b/],
 ['alcohol',/alkohol|alcohol|\bpiv[oaue]\b|\bvin[oaue]\b|\bvodk\w*|\bbeer\b|\bwine\b|\bsor\b|\bbor\b|\bpalinka\b/],
 ['nicotine',/nikotin|nicotin|kouren|kourim|fajc|cigaret|dohany|smok(?:ing|e)/]
];
function urgent(q){let n=normalize(q);
 // Remove explicit negations of a symptom, not unrelated positive symptoms.
 n=n.replace(/(?:nemam|nema|bez|no|without|nincs|nem) (?:zadn\w* )?(?:bolest(?:i)? na hrudi|chest pain|mellkasi fajdalom|krece|seizures?|potize s dychanim|difficulty breathing|breathing problems)/g,'');
 n=n.replace(/nejsem v bezvedomi|nie som v bezvedomi|not unconscious|nem vagyok eszmeletlen/g,'');
 if(/^(co je|what is|mi az|ake su|jake jsou|jaka jsou|what are|milyen|rizika|risks)\b/.test(n)&&!/(prave|ted|now|teraz|most|kamarad|friend|baratom|\bmam\b|i have|i am|\bpo\b|\bafter\b|\butan\b)/.test(n))return false;
 return /bezvedom|bez vedom|unconscious|unresponsive|eszmeletlen|nereaguje|not responding|nem reagal|nejde probudit|nelze probudit|neda sa zobudit|cannot wake|can t wake|won t wake|nem ebresztheto|nemohu dychat|nemuzu dychat|nemozem dychat|cannot breathe|can t breathe|not breathing|slow breathing|slowed breathing|difficulty breathing|potize s dychanim|problemy s dychanim|nedycha|dycha pomalu|lelegzet|nehezen kap levegot|nem kap levegot|lassu legzes|krece|krc[eio]|seizure|convuls|gorcs|roham|bolest na hrudi|boli (?:me |ma |ho )?(?:na )?hrud|chest pain|mellkasi fajdalm|silne zmaten|silna zmat|zavazn\w* zmaten|velmi zmaten|nevi kde je|severely confused|very confused|sulyos zavart|nagyon zavart|nem tudja hol van|predavkoval|overdosed|tuladagolt/.test(n);
}
function resolve(q,context){const n=normalize(q),previous=context?.substance||null;
 let found=groups.filter(([,re])=>re.test(n)).map(([id])=>id);
 // Mixed descriptions identify the substances, not just an undifferentiated drug bucket.
 if(found.includes('methamphetamine'))found=found.filter(x=>x!=='amphetamine');
 if(found.includes('vaping'))found=found.filter(x=>x!=='nicotine');
 const generic=/drog|navykov|psychoaktiv|pszichoaktiv|recreational|illicit|\bdrugs?\b|substance|narkotik|kabitoszer|fuggoseg/.test(n);
 if(previous&&!found.length&&/jednot|\bunits?\b|egysegek|hba1c|\ba1c\b|\bcgm\b|\btir\b/.test(n))return null;
 if(!found.length&&/diabetes drugs/.test(n)&&!/recreational|illicit/.test(n))return null;
 const vague=!found.length&&!generic&&/(\bto\b|\bit\b|\bez\b)/.test(n)&&/(cukr|cukor|glucose|blood sugar|vercuk|diabet)/.test(n)&&/(udela|urobi|ovlivni|ovplyvni|will it|affect|tesz|befolyasol)/.test(n);
 const ambiguous=/\bpernik\b|\btrava\b|\bice\b/.test(n)&&!found.length;
 const follow=!!previous&&(/^(a |and |es |what if|co kdyz|ako|jak|how|milyen|mi van)|diabet|cukrov|type [12]|typ|tipus|hipoglik|hypogly|nizky cuk|low blood sugar|alacsony vercuk|prehl|prehliad|miss/.test(n));
 if(!found.length&&follow)found=[previous];
 if(!found.length&&!generic&&!ambiguous&&!vague&&!/^(co mi to udela s cukrem|jak to ovlivni cukr|what will it do to my blood sugar)$/.test(n))return null;
 const after=/(uzil|uzila|dal jsem si|vzal jsem|vypil|pil jsem|fajcil|vypil som|pil som|uzil som|i took|i used|i drank|i smoked|hasznaltam|fogyasztottam|ittam|szivtam)/.test(n);
 const type=/(diabet|cukrov|type|typ|tipus)/.test(n)&&/\b[12]\b/.test(n);
 const awareness=/(prehl|prehliad|recogn|rozpozn|miss|notice|eszre|felismer)/.test(n)&&/(hypog|hipog|nizk|low|alacsony)/.test(n);
 const comparison=found.length>1&&/rozdil|rozdiel|difference|kulonbseg|versus|\bvs\b/.test(n);
 const mixing=(!comparison&&found.length>1)||/(kombin|mich|mix|combin|kever)/.test(n);
 return {kind:(ambiguous||vague)?'clarify':comparison?'compare':mixing?'mix':found[0]||'general',found,after,type,awareness,previous,n};
}
function boundary(q,intent){if(!intent)return null;const n=normalize(q);
 const medication=intent.found.some(k=>['sedative','opioid'].includes(k))||/(inzulin|insulin|metformin|\blek\w*|\bliek\w*|\bmedicine|\bmedication|gyogyszer|diazepam|alprazolam)/.test(n);
 const amount=/(kolik|kolko|how much|how many|hany|mennyi|mennyit|davk|dose|dosing|adag|jednotk|units?)/.test(n);
 if(medication&&amount)return 'refuse';
 if(medication&&/(prestat|vysad|vysadi|zmenit|stop taking|change.*dose|abbahagy|modosit)/.test(n))return 'refuse';
 const procedure=/(namich|kombinovat|kombinujem|mix|combine|kever|snup|inject|pichnout|vykourit|fogyassz|bevenni|uzit|take|vypit|drink|inni|smoke|szivni)/.test(n);
 const optimize=/(\bbezpecne\b|\bbezpecny\b|\bsafe\b|safely|silnej|zesilit|stronger|strongest|high|ucinek|effect|hatas|biztonsag|kolik|how much|mennyit)/.test(n);
 if(procedure&&/^(jak|ako|how|hogyan).*(snup|inject|pich|vykour|uzivat|uzit|take|bevenni|fogyassz|adagol)/.test(n))return 'refuse';
 if(procedure&&optimize&&(/^(jak|ako|how|hogyan|kolik|mennyit)/.test(n)||amount))return 'refuse';
 const clinicalNumber=n.replace(/(?:diabetes|diabetu|diabetem|type|typu?|tipus) [12](?: es| typu)?/g,'').replace(/[12] (?:es tipus|typu)/g,'');
 if(/(mam|muj|moj|moje|my |i have|nekem|enyem|vercukrom)/.test(clinicalNumber)&&/(cukr\b|glykem|glucose|blood sugar|vercukor|mmol|mg dl)/.test(clinicalNumber)&&/\b\d+(?: \d+)?\b/.test(clinicalNumber))return 'refuse';
 if((intent.after||intent.previous)&&/(tres|tras|shak|trembl|remeg|potim|poten|sweat|izzad)/.test(n))return 'hypo';
 return null;
}
function response(intent,language,override){const lang=DATA.labels[language]?language:'cs',ui=DATA.labels[lang];const kind=override||intent.kind;let parts=[],sources=[];
 const add=k=>{parts.push(DATA.copy[k][lang]);if(DATA.sources[k])sources.push(DATA.sources[k]);};
 if(['urgent','hypo','refuse','clarify'].includes(kind))add(kind);
 else if(kind==='compare'){for(const id of intent.found){const k=['amphetamine','methamphetamine','cocaine'].includes(id)?'stimulant':id;add(k);}sources.push(DATA.sources.general);}
 else if(kind==='mix'){add('mix');sources.push(DATA.sources.general);}
 else if(['amphetamine','methamphetamine','cocaine'].includes(kind)){add('stimulant');sources.push(DATA.sources.general);}
 else {add(DATA.copy[kind]?kind:'general');if(kind==='vaping')sources.push(DATA.sources.nicotine);if(['cannabis','sedative','opioid'].includes(kind))sources.push(DATA.sources.general);if(kind==='alcohol')sources.push(['Diabetes UK — Alcohol and diabetes','https://www.diabetes.org.uk/living-with-diabetes/eating/what-to-drink-with-diabetes/alcohol-and-diabetes']);}
 if(!['urgent','hypo','refuse','clarify'].includes(kind)){
  if(intent.type){add('type');sources.push(DATA.sources.dka,DATA.sources.hypo);}
  if(intent.awareness&&kind!=='general'){parts.push(DATA.copy.general[lang]);sources.push(DATA.sources.general);}
  if(intent.after)add('after');
 }
 if(kind==='refuse')sources.push(DATA.sources.opioid,DATA.sources.mix);
 if(kind==='clarify')sources.push(DATA.sources.general);
 const unique=[...new Map(sources.map(s=>[s[1],s])).values()];
 return {kind,title:ui.names[kind]||ui.heading,paragraphs:parts,sources:unique,labels:ui,found:intent.found||[],next:!['urgent','hypo','refuse'].includes(kind)?ui.follow:[]};
}
return Object.freeze({version:'2026-11-08-substances-1',normalize,isMood,resolve,urgent,boundary,response,sources:DATA.sources});});
