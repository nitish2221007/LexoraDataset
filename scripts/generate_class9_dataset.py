import os
import json
import re
import glob

# Standard NCERT Subject Titles & Chapter Mapping for Class 9
CHAPTER_MAP = {
    'history': {
        'title': 'History (India and the Contemporary World I)',
        'chapters': {
            'chapter_1': {'title': 'Chapter 1: The French Revolution', 'range': (1, 24)},
            'chapter_2': {'title': 'Chapter 2: Socialism in Europe and the Russian Revolution', 'range': (25, 50)},
            'chapter_3': {'title': 'Chapter 3: Nazism and the Rise of Hitler', 'range': (51, 74)},
            'chapter_4': {'title': 'Chapter 4: Forest Society and Colonialism', 'range': (75, 96)},
            'chapter_5': {'title': 'Chapter 5: Pastoralists in the Modern World', 'range': (97, 128)},
        }
    },
    'geography': {
        'title': 'Geography (Contemporary India I)',
        'chapters': {
            'chapter_1': {'title': 'Chapter 1: India - Size and Location', 'range': (1, 6)},
            'chapter_2': {'title': 'Chapter 2: Physical Features of India', 'range': (7, 16)},
            'chapter_3': {'title': 'Chapter 3: Drainage', 'range': (17, 25)},
            'chapter_4': {'title': 'Chapter 4: Climate', 'range': (26, 40)},
            'chapter_5': {'title': 'Chapter 5: Natural Vegetation and Wildlife', 'range': (41, 52)},
            'chapter_6': {'title': 'Chapter 6: Population', 'range': (53, 68)},
        }
    },
    'political_science': {
        'title': 'Political Science (Democratic Politics I)',
        'chapters': {
            'chapter_1': {'title': 'Chapter 1: What is Democracy? Why Democracy?', 'range': (1, 18)},
            'chapter_2': {'title': 'Chapter 2: Constitutional Design', 'range': (19, 36)},
            'chapter_3': {'title': 'Chapter 3: Electoral Politics', 'range': (37, 56)},
            'chapter_4': {'title': 'Chapter 4: Working of Institutions', 'range': (57, 78)},
            'chapter_5': {'title': 'Chapter 5: Democratic Rights', 'range': (79, 104)},
        }
    },
    'economics': {
        'title': 'Economics (Understanding Economic Development)',
        'chapters': {
            'chapter_1': {'title': 'Chapter 1: The Story of Village Palampur', 'range': (1, 15)},
            'chapter_2': {'title': 'Chapter 2: People as Resource', 'range': (16, 28)},
            'chapter_3': {'title': 'Chapter 3: Poverty as a Challenge', 'range': (29, 43)},
            'chapter_4': {'title': 'Chapter 4: Food Security in India', 'range': (44, 64)},
        }
    }
}

# Rich vocabulary database with English meaning, Hindi meaning, difficulty, and extra info
VOCAB_DB = {
    # French Revolution & History
    'monarchy': {'meaning': 'Form of government with a monarch (king or queen) at the head.', 'hindi': 'राजतंत्र / राजा का शासन', 'diff': 'Medium', 'pron': 'Mon-ar-chy', 'simple': 'Government ruled by a king or queen.', 'funny': 'One crown to rule them all, no elections required!', 'ex': 'France was an absolute monarchy before the revolution.', 'syn': ['kingdom', 'royalty', 'sovereignty']},
    'revolution': {'meaning': 'A forcible overthrow of a government or social order in favour of a new system.', 'hindi': 'क्रांति / बड़ा बदलाव', 'diff': 'Medium', 'pron': 'Rev-o-lu-tion', 'simple': 'A huge change when people fight for new rules.', 'funny': 'Flipping the script when everyone gets tired of the old bosses.', 'ex': 'The French Revolution began in 1789.', 'syn': ['rebellion', 'uprising', 'revolt']},
    'aristocracy': {'meaning': 'The highest class in certain societies, typically holding hereditary titles and office.', 'hindi': 'अभिजात वर्ग / कुलीन वर्ग', 'diff': 'Hard', 'pron': 'Ar-is-toc-ra-cy', 'simple': 'Rich nobility and high-born families.', 'funny': 'The fancy VIP club of history.', 'ex': 'The aristocracy enjoyed many tax privileges.', 'syn': ['nobility', 'gentry', 'elite']},
    'privilege': {'meaning': 'A special right, advantage, or immunity granted only to a particular person or group.', 'hindi': 'विशेषाधिकार / सुविधा', 'diff': 'Easy', 'hindi_m': 'विशेषाधिकार'},
    'subsistence': {'meaning': 'The action or state of remaining or keeping oneself alive.', 'hindi': 'जीविका / जीवन-निर्वाह', 'diff': 'Hard', 'pron': 'Sub-sis-tence', 'simple': 'Bare minimum needed to stay alive.', 'funny': 'Living on bread and water budget!', 'ex': 'France faced a subsistence crisis due to drought.', 'syn': ['survival', 'livelihood', 'maintenance']},
    'feudal': {'meaning': 'Relating to the system of social and land ownership in medieval Europe.', 'hindi': 'सामंती / ज़मींदारी प्रथा', 'diff': 'Hard', 'pron': 'Feu-dal', 'simple': 'Landlords holding power over peasant workers.', 'funny': 'Pay rent in crops or work for the lord for free.', 'ex': 'The National Assembly abolished the feudal system.', 'syn': ['manorial', 'seigneurial']},
    'manor': {'meaning': 'A unit of land, originally a feudal lordship consisting of a lord\'s house and lands.', 'hindi': 'जागीर / हवेली-क्षेत्र', 'diff': 'Medium', 'pron': 'Man-or', 'simple': 'A lord\'s large estate house and farm.', 'funny': 'The original mega-mansion with surrounding farms.', 'ex': 'Peasants attacked the chateaux and manors.', 'syn': ['estate', 'domain', 'hall']},
    'clergy': {'meaning': 'The body of all people ordained for religious duties in the Church.', 'hindi': 'पादरी वर्ग / धर्मगुरु', 'diff': 'Medium', 'pron': 'Cler-gy', 'simple': 'Religious officials like priests and bishops.', 'funny': 'The holy leaders who owned huge church lands.', 'ex': 'The clergy formed the First Estate in France.', 'syn': ['priesthood', 'ministers', 'ecclesiastics']},
    'tithe': {'meaning': 'A tax levied for the support of the Church, traditionally one-tenth of produce.', 'hindi': 'धार्मिक कर (दसवाँ हिस्सा)', 'diff': 'Hard', 'pron': 'Tithe', 'simple': 'Church tax taking 10% of farm produce.', 'funny': 'Giving 1 out of 10 apples directly to the church.', 'ex': 'The clergy extracted tithes from peasants.', 'syn': ['church tax', 'tribute']},
    'taille': {'meaning': 'A direct tax levied on the French peasantry before 1789.', 'hindi': 'प्रत्यक्ष राज्य कर', 'diff': 'Hard', 'pron': 'Tye', 'simple': 'Direct tax paid by common people to the state.', 'funny': 'The tax bill that went straight to the King\'s treasury.', 'ex': 'Members of the Third Estate had to pay taille.', 'syn': ['direct tax', 'levy']},
    'chateau': {'meaning': 'A castle or stately residence of a French noble.', 'hindi': 'किला / महल', 'diff': 'Easy', 'hindi_m': 'महल / किला'},
    'bourgeoisie': {'meaning': 'The middle class, including merchants, industrialists, and professional people.', 'hindi': 'मध्यम वर्ग / व्यापारी वर्ग', 'diff': 'Hard', 'pron': 'Bour-geoi-sie', 'simple': 'Educated middle class like doctors and merchants.', 'funny': 'Not nobles, but rich enough to demand equal rights!', 'ex': 'The bourgeoisie led the Third Estate\'s demands.', 'syn': ['middle class', 'mercantile class']},
    'guillotine': {'meaning': 'A machine with a heavy blade used for beheading people.', 'hindi': 'गिलोटिन (सिर कलम करने की मशीन)', 'diff': 'Hard', 'pron': 'Guil-lo-tine', 'simple': 'A execution device with a falling heavy blade.', 'funny': 'The scary haircut machine of the French Terror.', 'ex': 'King Louis XVI was executed by guillotine.', 'syn': ['execution device', 'decapitator']},
    'republic': {'meaning': 'A state in which supreme power is held by the people and their elected representatives.', 'hindi': 'गणतंत्र / जन-राज्य', 'diff': 'Medium', 'pron': 'Re-pub-lic', 'simple': 'Country ruled by elected leaders, not a king.', 'funny': 'No kings allowed, voters run the show!', 'ex': 'France was declared a republic in 1792.', 'syn': ['democracy', 'self-government']},
    'constitution': {'meaning': 'A body of fundamental principles according to which a state is governed.', 'hindi': 'संविधान / देश का कानून', 'diff': 'Medium', 'pron': 'Con-sti-tu-tion', 'simple': 'The supreme rulebook of a country.', 'funny': 'The ultimate cheat-sheet for running a government.', 'ex': 'The Assembly drafted the National Constitution in 1791.', 'syn': ['charter', 'code of laws']},
    'sovereignty': {'meaning': 'Supreme power or authority over a state or territory.', 'hindi': 'संप्रभुता / सर्वोच्च सत्ता', 'diff': 'Hard', 'pron': 'Sov-ereign-ty', 'simple': 'Complete independent control of a country.', 'funny': 'Being the boss of your own land with no outside orders.', 'ex': 'National sovereignty resides in the nation.', 'syn': ['autonomy', 'independence', 'supreme power']},
    'fraternity': {'meaning': 'A group of people sharing a common profession or interest; brotherhood.', 'hindi': 'बंधुत्व / भाईचारा', 'diff': 'Easy', 'hindi_m': 'भाईचारा / बंधुत्व'},
    'emancipation': {'meaning': 'The fact or process of being set free from legal, social, or political restrictions.', 'hindi': 'मुक्ति / स्वतंत्रता', 'diff': 'Hard', 'pron': 'E-man-ci-pa-tion', 'simple': 'Setting people free from slavery or bondage.', 'funny': 'Unlocking the chains for total freedom!', 'ex': 'The emancipation of slaves was decreed in 1794.', 'syn': ['liberation', 'freedom', 'release']},
    'pastoralist': {'meaning': 'A sheep or cattle farmer or nomadic herder.', 'hindi': 'चरवाहा / पशुपालक', 'diff': 'Medium', 'pron': 'Pas-to-ral-ist', 'simple': 'Nomad who moves with livestock herds.', 'funny': 'Road-trippers with sheep and cattle!', 'ex': 'Pastoralists moved seasonally for fresh pastures.', 'syn': ['nomad', 'herder', 'grazier']},
    'nomad': {'meaning': 'A member of a community that moves from place to place rather than settling permanently.', 'hindi': 'खानाबदोश / घुमंतू', 'diff': 'Easy', 'hindi_m': 'घुमंतू / खानाबदोश'},
    
    # Geography
    'latitude': {'meaning': 'The angular distance of a place north or south of the earth\'s equator.', 'hindi': 'अक्षांश', 'diff': 'Medium', 'pron': 'Lat-i-tude', 'simple': 'Horizontal lines around the globe.', 'funny': 'Flat-itude lines lying down East to West.', 'ex': 'India lies entirely in the Northern Hemisphere latitude.', 'syn': ['parallel']},
    'longitude': {'meaning': 'The angular distance of a place east or west of the meridian at Greenwich.', 'hindi': 'देशांतर', 'diff': 'Medium', 'pron': 'Long-i-tude', 'simple': 'Vertical lines running from North Pole to South Pole.', 'funny': 'Tall long lines stretching top to bottom.', 'ex': 'Standard Meridian longitude passes through Mirzapur.', 'syn': ['meridian']},
    'subcontinent': {'meaning': 'A large, distinguishable part of a continent.', 'hindi': 'उपमहाद्वीप', 'diff': 'Easy', 'hindi_m': 'उपमहाद्वीप'},
    'peninsula': {'meaning': 'A piece of land almost surrounded by water or projecting out into a body of water.', 'hindi': 'प्रायद्वीप', 'diff': 'Medium', 'pron': 'Pen-in-su-la', 'simple': 'Land surrounded by water on 3 sides.', 'funny': 'A land finger poking into the sea.', 'ex': 'Southern India forms a huge peninsula.', 'syn': ['promontory', 'headland']},
    'strait': {'meaning': 'A narrow passage of water connecting two seas or large water areas.', 'hindi': 'जलडमरूमध्य / जलसंधि', 'diff': 'Hard', 'pron': 'Strait', 'simple': 'Narrow water channel between two landmasses.', 'funny': 'The thin sea highway between countries.', 'ex': 'Palk Strait separates India and Sri Lanka.', 'syn': ['channel', 'sound', 'pass']},
    'monsoon': {'meaning': 'A seasonal prevailing wind in South Asia bringing rain.', 'hindi': 'मानसूनी हवाएं / वर्षा ऋतु', 'diff': 'Easy', 'hindi_m': 'मानसून / वर्षा ऋतु'},
    'tributary': {'meaning': 'A river or stream flowing into a larger river or lake.', 'hindi': 'सहायक नदी', 'diff': 'Medium', 'pron': 'Trib-u-ta-ry', 'simple': 'Smaller river feeding into a big main river.', 'funny': 'The side streams that join the main water party.', 'ex': 'Yamuna is the major tributary of the Ganga.', 'syn': ['feeder', 'branch']},
    'distributary': {'meaning': 'A branch of a river that does not return to the main stream after leaving it.', 'hindi': 'वितरिका नदी', 'diff': 'Hard', 'pron': 'Dis-trib-u-ta-ry', 'simple': 'River branch breaking off near the ocean delta.', 'funny': 'River branches saying goodbye before entering the sea.', 'ex': 'Hooghly is a distributary of the Ganga.', 'syn': ['river branch', 'outlet']},
    'glacier': {'meaning': 'A slowly moving mass or river of ice formed by snow accumulation.', 'hindi': 'हिमनद / ग्लेशियर', 'diff': 'Easy', 'hindi_m': 'हिमनद / बर्फ की नदी'},
    'alluvial': {'meaning': 'Relating to or derived from alluvium (clay, silt, sand) deposited by flowing water.', 'hindi': 'जलोढ़ मिट्टी', 'diff': 'Medium', 'pron': 'Al-lu-vi-al', 'simple': 'Fertile river silt soil.', 'funny': 'Super-rich muddy soil gift from mountain rivers.', 'ex': 'Northern plains consist of fertile alluvial soil.', 'syn': ['silty', 'clayey']},

    # Political Science
    'democracy': {'meaning': 'A system of government by the whole population through elected representatives.', 'hindi': 'लोकतंत्र / प्रजातंत्र', 'diff': 'Medium', 'pron': 'De-moc-ra-cy', 'simple': 'Rule of the people, by the people, for the people.', 'funny': 'Voting for leaders instead of taking orders from kings!', 'ex': 'India is the world\'s largest democracy.', 'syn': ['republic', 'popular government']},
    'referendum': {'meaning': 'A general vote by the electorate on a single political question for a direct decision.', 'hindi': 'जनमत संग्रह', 'diff': 'Hard', 'pron': 'Ref-er-en-dum', 'simple': 'Direct vote by all citizens on a specific law.', 'funny': 'Asking the whole nation yes or no at once!', 'ex': 'General Musharraf held a referendum in Pakistan in 2002.', 'syn': ['plebiscite', 'public vote']},
    'autocracy': {'meaning': 'A system of government by one person with absolute power.', 'hindi': 'एकतंत्र / तानाशाही', 'diff': 'Hard', 'pron': 'Au-toc-ra-cy', 'simple': 'Rule by one single dictator.', 'funny': 'One person gets all the remote control buttons.', 'ex': 'Citizens suffered under absolute autocracy.', 'syn': ['dictatorship', 'despotism', 'tyranny']},
    'franchise': {'meaning': 'The right to vote in public political elections.', 'hindi': 'मताधिकार / वोट देने का अधिकार', 'diff': 'Medium', 'pron': 'Fran-chise', 'simple': 'Legal right of citizens to vote.', 'funny': 'Your official power ticket to choose the government.', 'ex': 'Universal adult franchise gives every adult one vote.', 'syn': ['suffrage', 'voting right']},
    'suffrage': {'meaning': 'The right to vote in political elections.', 'hindi': 'मताधिकार', 'diff': 'Easy', 'hindi_m': 'वोट देने का अधिकार'},
    'secular': {'meaning': 'Not connected with religious or spiritual matters; official neutrality to religion.', 'hindi': 'धर्मनिरपेक्ष', 'diff': 'Medium', 'pron': 'Sec-u-lar', 'simple': 'Government treats all religions equally.', 'funny': 'No official state religion, all beliefs respected.', 'ex': 'The Preamble declares India to be a secular state.', 'syn': ['non-religious', 'neutral']},
    'preamble': {'meaning': 'A preliminary or introductory statement in a constitution stating its principles.', 'hindi': 'प्रस्तावना / उद्देश्यिका', 'diff': 'Medium', 'pron': 'Pre-am-ble', 'simple': 'The opening introductory page of the Constitution.', 'funny': 'The trailer and summary of the whole Constitution.', 'ex': 'The Preamble outlines the core values of India.', 'syn': ['introduction', 'preface']},
    'judiciary': {'meaning': 'The judicial authorities of a country; judges and court system collectively.', 'hindi': 'न्यायपालिका / अदालतें', 'diff': 'Easy', 'hindi_m': 'न्यायपालिका / अदालत'},

    # Economics
    'production': {'meaning': 'The action of manufacturing or making components or goods from raw materials.', 'hindi': 'उत्पादन', 'diff': 'Easy', 'hindi_m': 'उत्पादन / निर्माण'},
    'capital': {'meaning': 'Wealth in the form of money or assets owned by a person or organization.', 'hindi': 'पूंजी / मूलधन', 'diff': 'Medium', 'pron': 'Cap-i-tal', 'simple': 'Money, tools, or buildings needed for business.', 'funny': 'The coins and machinery that make the factory run!', 'ex': 'Farmers need working capital to buy seeds.', 'syn': ['investment', 'funds', 'assets']},
    'livelihood': {'meaning': 'A means of securing the necessities of life.', 'hindi': 'जीविका / रोज़गार', 'diff': 'Easy', 'hindi_m': 'आजीविका / कमाई'},
    'unemployment': {'meaning': 'The state of not having a job despite actively seeking work.', 'hindi': 'बेरोज़गारी', 'diff': 'Medium', 'pron': 'Un-em-ploy-ment', 'simple': 'Wanting a job but not being able to find one.', 'funny': 'Ready to work, but no job openings available.', 'ex': 'Disguised unemployment is common in agriculture.', 'syn': ['joblessness', 'idleness']},
    'poverty': {'meaning': 'The state of being extremely poor, lacking basic necessities.', 'hindi': 'गरीबी / निर्धनता', 'diff': 'Easy', 'hindi_m': 'गरीबी / निर्धनता'},
    'scarcity': {'meaning': 'The state of being scarce or in short supply; shortage.', 'hindi': 'कमी / किल्लत', 'diff': 'Medium', 'pron': 'Scar-ci-ty', 'simple': 'Shortage when demand is higher than supply.', 'funny': 'Not enough slices of pie for everyone at the table!', 'ex': 'Food scarcity caused widespread distress.', 'syn': ['shortage', 'dearth', 'deficiency']}
}

input_base_dir = r'D:\OneDrive\Desktop\NCERT-Class-9-English-Social-Science\text'
output_base_dir = r'c:\Users\yniti\lexora\LexoraDataset\dataset\class_9'

os.makedirs(output_base_dir, exist_ok=True)
total_words_generated = 0

for subj_key, subj_info in CHAPTER_MAP.items():
    subj_dir = os.path.join(output_base_dir, subj_key)
    os.makedirs(subj_dir, exist_ok=True)
    
    txt_subj_dir = os.path.join(input_base_dir, 'Political-Science' if subj_key == 'political_science' else subj_key.capitalize())
    
    for chap_key, chap_info in subj_info['chapters'].items():
        start_p, end_p = chap_info['range']
        chapter_pages_data = []
        
        for page_num in range(start_p, end_p + 1):
            txt_path = os.path.join(txt_subj_dir, f"page_{page_num:03d}.txt")
            if not os.path.exists(txt_path):
                continue
                
            with open(txt_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            # Mine words for this page
            page_words = []
            seen_words = set()
            
            for key_term, meta in VOCAB_DB.items():
                pattern = r'\b' + re.escape(key_term) + r'(s|es|ed|ing|ly)?\b'
                if re.search(pattern, content, re.IGNORECASE) and key_term not in seen_words:
                    seen_words.add(key_term)
                    
                    w_id = f"class_9_{subj_key}_{chap_key}_p{page_num}_{key_term}"
                    diff = meta['diff']
                    
                    word_obj = {
                        "id": w_id,
                        "word": key_term.capitalize(),
                        "difficulty": diff,
                        "meaning": meta['meaning'],
                        "hindi_meaning": meta.get('hindi', meta.get('hindi_m', ''))
                    }
                    
                    # USER MANDATE: Only include medium/extra info for Medium and Hard words! NO extra info for Easy words!
                    if diff in ['Medium', 'Hard'] and 'pron' in meta:
                        word_obj["medium"] = {
                            "pronunciation": meta['pron'],
                            "simple_explanation": meta['simple'],
                            "funny_explanation": meta['funny'],
                            "examples": [{"type": "normal", "text": meta['ex']}],
                            "synonyms": meta.get('syn', [])
                        }
                        
                    page_words.append(word_obj)
                    total_words_generated += 1
                    
            if page_words:
                chapter_pages_data.append({
                    "page_no": page_num,
                    "words": page_words
                })
                
        # Write chapter JSON
        out_chap_file = os.path.join(subj_dir, f"{chap_key}.json")
        with open(out_chap_file, 'w', encoding='utf-8') as f:
            json.dump(chapter_pages_data, f, indent=2, ensure_ascii=False)
            
        print(f"[OK] Generated {subj_key}/{chap_key}.json ({len(chapter_pages_data)} pages)")

print(f"\nSuccessfully generated Class 9 Dataset! Total vocabulary words created: {total_words_generated}")
