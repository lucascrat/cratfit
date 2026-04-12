/**
 * seed_foods.mjs
 * Populates the `foods` table with ~350 common Brazilian and international foods
 * based on TACO (Tabela Brasileira de Composição de Alimentos) + USDA data.
 *
 * Run: node scripts/seed_foods.mjs
 *
 * Columns per entry: [name, name_en, category, serving_g, serving_desc,
 *   calories, protein_g, carbs_g, fats_g, fiber_g, sugar_g,
 *   sodium_mg, calcium_mg, iron_mg, potassium_mg, vitamin_c_mg, source]
 */

import 'dotenv/config';
import pg from 'pg';

const DB_URL = process.env.DATABASE_URL ||
  'postgres://postgres:QgvpSkSX212FO6kvfgW5gxdFIm3EtW0BOgZ6Pzb0ObiXlttf06I8ksbfBWIS7rtA@187.77.230.251:5434/postgres';

const pool = new pg.Pool({ connectionString: DB_URL, ssl: false });

// ─── Food data ────────────────────────────────────────────────────────────────
// Format: [name, name_en, category, serving_g, serving_desc,
//          cal, prot, carb, fat, fiber, sugar, sodium, calcium, iron, potassium, vit_c, source]
const FOODS = [
  // ── CEREAIS E GRÃOS ──────────────────────────────────────────────────────
  ['Arroz branco cozido','Cooked white rice','grains',100,'100g',128,2.5,28.1,0.2,1.6,0,1,5,0.1,26,0,'TACO'],
  ['Arroz integral cozido','Cooked brown rice','grains',100,'100g',124,2.6,25.8,1.0,2.7,0,1,6,0.3,79,0,'TACO'],
  ['Feijão cozido','Cooked black beans','grains',86,'1 concha (86g)',77,4.8,13.6,0.5,8.4,0,2,27,1.5,255,0,'TACO'],
  ['Feijão carioca cozido','Cooked pinto beans','grains',86,'1 concha (86g)',76,4.8,13.5,0.5,8.5,0,2,27,1.5,245,0,'TACO'],
  ['Lentilha cozida','Cooked lentils','grains',100,'100g',116,9.0,20.1,0.4,7.9,1.8,2,19,3.3,369,1.5,'USDA'],
  ['Grão-de-bico cozido','Cooked chickpeas','grains',100,'100g',164,8.9,27.4,2.6,7.6,4.8,7,49,2.9,291,1.3,'USDA'],
  ['Macarrão cozido','Cooked pasta','grains',100,'100g',131,4.8,26.9,0.9,1.5,0,1,7,1.0,45,0,'TACO'],
  ['Macarrão integral cozido','Whole wheat pasta','grains',100,'100g',124,5.3,26.5,0.5,3.9,0,4,21,1.3,62,0,'USDA'],
  ['Pão francês','French bread roll','grains',50,'1 unidade (50g)',134,4.2,26.4,1.1,1.0,1.5,263,13,1.2,50,0,'TACO'],
  ['Pão de forma integral','Whole wheat bread','grains',25,'1 fatia (25g)',60,2.7,10.6,1.0,1.7,1.3,138,34,1.0,87,0,'TACO'],
  ['Pão de queijo assado','Cheese bread','grains',30,'1 unidade (30g)',93,2.8,13.2,3.4,0.3,0,112,80,0.3,22,0,'TACO'],
  ['Aveia em flocos','Rolled oats','grains',30,'3 colheres de sopa',103,3.6,18.0,1.8,2.7,0.4,1,15,1.5,107,0,'TACO'],
  ['Tapioca hidratada','Tapioca','grains',60,'2 colheres de sopa',107,0.1,27.3,0,0,0,1,3,0.1,6,0,'TACO'],
  ['Cuscuz de milho cozido','Couscous cooked','grains',100,'100g',78,1.7,17.0,0.5,1.5,0,2,2,0.4,32,0,'TACO'],
  ['Batata doce cozida','Sweet potato','grains',100,'100g',77,1.4,18.4,0.1,2.4,5.7,36,27,0.6,230,12.8,'TACO'],
  ['Batata inglesa cozida','Boiled potato','grains',100,'100g',52,1.2,11.9,0.1,1.3,0.9,5,5,0.4,328,13.0,'TACO'],
  ['Mandioca cozida','Cooked cassava','grains',100,'100g',125,0.6,30.1,0.3,1.4,1.7,9,16,0.3,196,20.0,'TACO'],
  ['Inhame cozido','Cooked yam','grains',100,'100g',116,1.5,27.5,0.1,3.9,0.5,9,14,0.5,670,12.0,'USDA'],
  ['Fubá de milho cru','Corn flour','grains',100,'100g',361,8.1,77.7,1.7,5.6,0,3,4,1.4,284,0,'TACO'],
  ['Granola sem açúcar','Sugar-free granola','grains',40,'40g',158,3.8,22.0,6.0,3.2,4.0,5,21,1.4,141,0,'custom'],
  ['Quinoa cozida','Cooked quinoa','grains',100,'100g',120,4.4,21.3,1.9,2.8,0.9,7,17,1.5,172,0,'USDA'],

  // ── PROTEÍNAS ─────────────────────────────────────────────────────────────
  ['Peito de frango grelhado','Grilled chicken breast','proteins',120,'1 filé médio (120g)',195,38.2,0,4.3,0,0,88,14,1.1,302,0,'TACO'],
  ['Coxa de frango grelhada','Grilled chicken thigh','proteins',100,'100g',175,22.0,0,9.5,0,0,90,10,1.1,224,0,'TACO'],
  ['Carne moída 85% cozida','Cooked ground beef 85%','proteins',100,'100g',218,26.1,0,12.2,0,0,79,14,2.3,338,0,'USDA'],
  ['Alcatra grelhada','Grilled sirloin','proteins',120,'1 bife (120g)',214,30.0,0,10.0,0,0,72,15,2.5,360,0,'TACO'],
  ['Filé de tilápia grelhado','Grilled tilapia','proteins',120,'1 filé (120g)',142,29.8,0,2.7,0,0,78,28,0.7,490,0,'TACO'],
  ['Atum em lata (ao natural)','Canned tuna in water','proteins',100,'100g',128,29.2,0,1.3,0,0,323,10,1.2,314,0,'TACO'],
  ['Salmão grelhado','Grilled salmon','proteins',120,'1 filé (120g)',234,29.4,0,12.6,0,0,62,28,0.6,516,0,'USDA'],
  ['Ovo inteiro cozido','Boiled egg','proteins',50,'1 unidade grande',77,6.3,0.6,5.3,0,0.6,62,25,0.9,63,0,'TACO'],
  ['Clara de ovo cozida','Cooked egg white','proteins',33,'1 clara grande',17,3.6,0.2,0,0,0.2,55,2,0.1,54,0,'USDA'],
  ['Omelete 2 ovos','2-egg omelette','proteins',120,'1 omelete',182,12.5,1.2,14.0,0,1.2,346,54,1.8,140,0,'custom'],
  ['Whey protein (scoop)','Whey protein scoop','proteins',30,'1 scoop (30g)',119,24.0,3.0,1.5,0,2.0,100,100,0.5,160,0,'custom'],
  ['Carne de porco (lombo)','Pork loin grilled','proteins',100,'100g',197,22.3,0,11.8,0,0,64,8,0.8,359,0,'TACO'],
  ['Sardinha em lata','Canned sardines','proteins',100,'100g',187,25.4,0,9.3,0,0,505,382,3.2,397,0,'TACO'],
  ['Camarão cozido','Cooked shrimp','proteins',100,'100g',99,23.7,0.2,0.6,0,0,224,64,0.3,185,1.9,'USDA'],
  ['Peito de peru fatiado','Turkey breast sliced','proteins',50,'2 fatias',63,12.0,1.0,1.2,0,0.6,390,4,0.4,189,0,'custom'],
  ['Atum grelhado','Grilled tuna steak','proteins',150,'1 posta',222,43.8,0,3.0,0,0,96,24,1.5,430,0,'USDA'],
  ['Costela bovina cozida','Cooked beef ribs','proteins',100,'100g',292,22.1,0,22.8,0,0,55,14,2.4,281,0,'TACO'],

  // ── LATICÍNIOS ────────────────────────────────────────────────────────────
  ['Leite integral','Whole milk','dairy',200,'1 copo (200ml)',122,6.2,9.6,6.2,0,9.6,98,214,0.1,298,1.6,'TACO'],
  ['Leite desnatado','Skim milk','dairy',200,'1 copo (200ml)',67,6.6,9.8,0.2,0,9.8,105,219,0.1,321,1.7,'TACO'],
  ['Iogurte natural integral','Whole plain yogurt','dairy',170,'1 pote (170g)',101,5.9,8.0,4.7,0,8.0,72,188,0.1,241,0.9,'TACO'],
  ['Iogurte grego (0%)','Greek yogurt 0%','dairy',150,'1 pote (150g)',89,16.0,5.0,0.5,0,4.0,56,160,0.1,196,0,'custom'],
  ['Queijo minas frescal','Fresh minas cheese','dairy',30,'1 fatia (30g)',64,4.2,1.7,4.7,0,0.7,130,128,0.1,42,0,'TACO'],
  ['Queijo muçarela','Mozzarella cheese','dairy',30,'1 fatia (30g)',90,6.3,0.6,7.1,0,0,176,183,0.1,18,0,'TACO'],
  ['Queijo cottage','Cottage cheese','dairy',100,'100g',98,11.1,3.4,4.3,0,2.7,364,61,0.2,84,0,'TACO'],
  ['Requeijão cremoso','Cream cheese requeijão','dairy',30,'1 colher de sopa',71,2.1,2.7,6.0,0,2.7,196,53,0.1,38,0,'TACO'],
  ['Manteiga','Butter','dairy',10,'1 colher de chá',72,0.1,0,8.1,0,0,77,2,0,2,0,'TACO'],
  ['Creme de leite','Heavy cream','dairy',20,'1 colher de sopa',63,0.5,1.2,6.4,0,1.2,7,12,0,30,0,'TACO'],
  ['Queijo parmesão ralado','Grated parmesan','dairy',10,'1 colher de sopa',44,3.7,0.4,3.1,0,0,176,119,0.1,25,0,'TACO'],

  // ── FRUTAS ────────────────────────────────────────────────────────────────
  ['Banana nanica','Banana','fruits',87,'1 unidade média',75,0.9,19.4,0.1,1.9,12.2,1,7,0.3,358,8.8,'TACO'],
  ['Maçã com casca','Apple with skin','fruits',138,'1 unidade média',72,0.4,19.1,0.2,3.3,14.3,1,9,0.1,148,6.3,'TACO'],
  ['Laranja','Orange','fruits',131,'1 unidade média',62,1.2,14.4,0.1,2.4,11.8,0,52,0.1,237,59.1,'TACO'],
  ['Mamão papaia','Papaya','fruits',100,'1 fatia média',39,0.5,10.4,0.1,1.7,7.8,3,20,0.2,182,62.0,'TACO'],
  ['Abacaxi','Pineapple','fruits',100,'1 fatia',50,0.5,13.1,0.1,1.4,9.9,1,13,0.3,109,47.8,'TACO'],
  ['Manga','Mango','fruits',100,'1/2 manga',59,0.8,15.5,0.2,1.6,13.7,1,10,0.2,168,28.0,'TACO'],
  ['Melancia','Watermelon','fruits',150,'1 fatia',46,0.9,10.4,0.2,0.6,8.1,2,10,0.2,158,12.3,'TACO'],
  ['Morango','Strawberry','fruits',100,'10 unidades',32,0.7,7.7,0.3,2.0,4.9,1,16,0.4,153,58.8,'TACO'],
  ['Uva (sem semente)','Seedless grapes','fruits',100,'1 xícara',69,0.7,18.1,0.2,0.9,15.5,2,10,0.4,191,10.8,'TACO'],
  ['Abacate','Avocado','fruits',100,'1/2 abacate médio',160,2.0,8.5,14.7,6.7,0.7,7,12,0.6,485,10.0,'TACO'],
  ['Coco fresco (polpa)','Fresh coconut','fruits',50,'2 colheres de sopa',177,1.6,7.6,17.0,4.7,3.3,10,6,1.1,203,2.8,'TACO'],
  ['Pera','Pear','fruits',100,'1 unidade pequena',56,0.4,15.1,0.1,3.1,9.8,1,9,0.2,116,4.3,'TACO'],
  ['Goiaba vermelha','Red guava','fruits',100,'1 unidade média',54,2.6,10.1,1.0,6.3,4.0,3,18,0.3,417,228.3,'TACO'],
  ['Maracujá (suco)','Passion fruit juice','fruits',200,'1 copo',96,1.2,24.2,0.2,0.4,0,11,11,0.5,272,30.0,'TACO'],
  ['Kiwi','Kiwi','fruits',70,'1 unidade',43,0.8,10.1,0.4,2.1,6.2,2,34,0.2,212,64.0,'USDA'],
  ['Melão','Cantaloupe','fruits',100,'1 fatia',34,0.8,8.2,0.2,0.9,7.9,16,9,0.2,267,36.7,'TACO'],

  // ── VERDURAS E LEGUMES ────────────────────────────────────────────────────
  ['Alface (folhas)','Lettuce','vegetables',50,'1 xícara',7,0.7,1.1,0.1,0.9,0.5,7,18,0.3,116,2.8,'TACO'],
  ['Tomate','Tomato','vegetables',100,'1 unidade média',18,0.9,3.9,0.2,1.2,2.6,9,11,0.3,237,21.2,'TACO'],
  ['Cenoura crua','Raw carrot','vegetables',60,'1 unidade média',25,0.6,5.8,0.1,1.7,2.9,42,20,0.2,195,3.6,'TACO'],
  ['Brócolis cozido','Cooked broccoli','vegetables',100,'100g',35,2.4,6.6,0.4,3.3,1.7,40,47,0.7,293,64.9,'TACO'],
  ['Espinafre cozido','Cooked spinach','vegetables',100,'100g',21,2.1,3.4,0.3,2.2,0.4,70,136,3.6,466,9.8,'TACO'],
  ['Cebola crua','Raw onion','vegetables',80,'1 unidade média',32,1.0,7.5,0.1,1.4,3.4,3,19,0.2,146,7.4,'TACO'],
  ['Alho','Garlic','vegetables',5,'2 dentes',7,0.3,1.6,0,0.1,0.1,1,5,0.1,24,0.9,'TACO'],
  ['Pepino','Cucumber','vegetables',100,'1/2 pepino médio',16,0.7,3.6,0.1,0.5,1.7,2,16,0.3,147,2.8,'TACO'],
  ['Abobrinha cozida','Cooked zucchini','vegetables',100,'100g',16,1.1,3.3,0.1,1.0,2.5,3,14,0.3,261,9.0,'TACO'],
  ['Beterraba cozida','Cooked beet','vegetables',100,'1 unidade média',43,1.7,9.5,0.1,2.0,6.8,65,13,0.8,305,4.9,'TACO'],
  ['Chuchu cozido','Cooked chayote','vegetables',100,'100g',20,0.7,4.5,0.1,1.6,1.9,7,10,0.2,125,4.5,'TACO'],
  ['Couve manteiga crua','Kale','vegetables',30,'3 folhas grandes',20,1.8,3.4,0.3,1.6,0.4,9,79,0.6,152,41.5,'TACO'],
  ['Ervilha cozida','Cooked peas','vegetables',100,'100g',84,5.4,14.5,0.4,5.5,5.7,3,26,1.5,271,14.2,'TACO'],
  ['Milho cozido','Cooked corn','vegetables',100,'1 espiga pequena',74,2.7,17.0,1.2,2.4,2.9,1,3,0.5,218,6.2,'TACO'],
  ['Repolho cru','Raw cabbage','vegetables',50,'1/4 xícara',13,0.7,2.8,0.1,1.2,1.5,8,22,0.2,130,27.0,'TACO'],
  ['Pimentão vermelho','Red bell pepper','vegetables',80,'1/2 unidade',24,0.9,5.5,0.2,1.9,3.6,4,8,0.4,177,95.0,'TACO'],
  ['Quiabo cozido','Cooked okra','vegetables',100,'100g',25,2.1,5.0,0.1,3.2,1.2,8,77,0.4,303,16.3,'TACO'],
  ['Abóbora cozida','Cooked pumpkin','vegetables',100,'100g',17,0.6,4.2,0.1,1.0,1.8,1,15,0.3,230,6.0,'TACO'],

  // ── ÓLEOS E GORDURAS ──────────────────────────────────────────────────────
  ['Azeite de oliva extra virgem','Extra virgin olive oil','fats',10,'1 colher de sopa',88,0,0,10.0,0,0,0,0,0,0,0,'TACO'],
  ['Óleo de coco','Coconut oil','fats',10,'1 colher de sopa',87,0,0,10.0,8.7,0,0,0,0,0,0,'USDA'],
  ['Óleo de girassol','Sunflower oil','fats',10,'1 colher de sopa',87,0,0,10.0,0,0,0,0,0,0,0,'TACO'],
  ['Pasta de amendoim (integral)','Peanut butter natural','fats',32,'2 colheres de sopa',190,7.0,7.0,16.0,1.9,3.0,147,14,0.6,200,0,'USDA'],
  ['Castanha do Pará','Brazil nut','fats',5,'1 unidade',33,0.7,0.6,3.4,0.4,0.1,0,8,0.2,33,0.1,'TACO'],
  ['Castanha de caju','Cashew nut','fats',30,'10 unidades',163,5.0,8.5,13.3,0.8,2.5,4,11,1.6,160,0,'TACO'],
  ['Amendoim torrado sem sal','Roasted peanuts no salt','fats',30,'30g',176,7.8,5.0,15.0,2.4,1.0,4,20,0.9,212,0,'TACO'],
  ['Nozes','Walnuts','fats',30,'30g',196,4.3,4.1,19.6,2.0,0.8,1,28,0.8,125,0.3,'USDA'],
  ['Sementes de chia','Chia seeds','fats',15,'1 colher de sopa',72,2.5,6.0,4.6,5.1,0,2,126,1.3,114,0.6,'USDA'],
  ['Linhaça','Flaxseed','fats',10,'1 colher de sopa',53,1.8,2.9,4.2,2.8,0.2,3,26,0.6,84,0.1,'USDA'],

  // ── BEBIDAS ───────────────────────────────────────────────────────────────
  ['Água mineral','Mineral water','beverages',250,'1 copo',0,0,0,0,0,0,4,8,0,0,0,'custom'],
  ['Café preto sem açúcar','Black coffee','beverages',200,'1 xícara',4,0.3,0.7,0,0,0,4,7,0.1,128,0,'TACO'],
  ['Suco de laranja natural','Natural orange juice','beverages',200,'1 copo',88,1.3,20.6,0.2,0.5,18.0,1,14,0.2,352,88.0,'TACO'],
  ['Suco de uva integral','Grape juice','beverages',200,'1 copo',128,0.8,31.8,0.2,0.4,30.0,10,14,0.4,200,0,'TACO'],
  ['Leite de amêndoas (sem açúcar)','Unsweetened almond milk','beverages',240,'1 copo',37,1.5,1.5,2.5,0.5,0,155,451,0.7,176,0,'custom'],
  ['Chá verde sem açúcar','Unsweetened green tea','beverages',200,'1 xícara',2,0,0.5,0,0,0,2,2,0,21,0,'custom'],
  ['Refrigerante cola','Cola soda','beverages',350,'1 lata',147,0,38.0,0,0,38.0,45,7,0.1,15,0,'custom'],
  ['Água de coco natural','Coconut water','beverages',200,'1 copo',38,1.0,9.0,0.2,0,6.0,64,24,0.2,400,4.0,'TACO'],
  ['Vitamina de banana c/ leite','Banana milk shake','beverages',250,'1 copo',196,7.0,33.5,4.0,1.7,20.0,90,180,0.4,480,5.0,'custom'],
  ['Proteína shake (whey + leite)','Protein shake','beverages',350,'1 copo',270,32.0,20.0,5.0,0.5,14.0,250,300,0.8,450,1.0,'custom'],

  // ── LANCHES E PADARIA ─────────────────────────────────────────────────────
  ['Biscoito de polvilho','Tapioca biscuit','sweets',25,'1 pacotinho',108,0.7,22.5,1.4,0.1,0,89,4,0.1,7,0,'TACO'],
  ['Biscoito recheado (chocolate)','Chocolate sandwich cookie','sweets',30,'3 unidades',150,1.5,22.0,6.0,0.7,12.0,130,8,1.1,55,0,'custom'],
  ['Bolo de cenoura sem cobertura','Carrot cake no frosting','sweets',60,'1 fatia',188,3.2,28.0,7.5,1.2,14.0,140,25,0.9,110,0,'custom'],
  ['Chocolate meio amargo (70%)','Dark chocolate 70%','sweets',20,'2 quadradinhos',114,1.7,9.4,8.8,1.9,5.0,2,14,1.1,90,0,'USDA'],
  ['Chocolate ao leite','Milk chocolate','sweets',20,'2 quadradinhos',107,1.6,12.0,6.5,0.6,11.5,23,50,0.6,95,0,'TACO'],
  ['Sorvete de creme','Vanilla ice cream','sweets',100,'1 bola grande',207,3.5,23.6,11.3,0,21.0,80,128,0.1,170,1.0,'TACO'],
  ['Pipoca com manteiga','Buttered popcorn','sweets',30,'1 xícara grande',152,2.5,18.0,8.0,3.5,0,230,4,0.9,78,0,'custom'],
  ['Barra de cereal','Cereal bar','sweets',25,'1 unidade',97,1.6,16.5,3.0,1.2,8.0,65,22,1.2,80,0,'custom'],
  ['Paçoca','Paçoca (peanut candy)','sweets',25,'1 unidade',121,3.5,15.6,5.4,0.9,9.0,5,13,0.5,87,0,'TACO'],
  ['Brigadeiro','Brigadeiro (chocolate)','sweets',15,'1 unidade',66,1.0,9.0,3.2,0.2,8.5,22,28,0.3,55,0,'custom'],

  // ── COMIDA CASEIRA / PREPARAÇÕES ─────────────────────────────────────────
  ['Frango com arroz e feijão (refeição)','Chicken rice beans','prepared',350,'1 prato medium',490,38.0,55.0,11.0,8.5,0,180,55,3.5,620,2.0,'custom'],
  ['Macarrão ao molho de tomate','Pasta with tomato sauce','prepared',250,'1 prato',289,10.5,52.0,4.5,4.0,6.0,420,35,2.0,380,18.0,'custom'],
  ['Salada mista simples','Simple mixed salad','prepared',150,'1 prato de salada',38,2.0,7.0,0.5,2.5,3.0,50,45,0.8,350,28.0,'custom'],
  ['Sopa de legumes','Vegetable soup','prepared',250,'1 tigela',92,3.5,17.0,1.5,3.5,4.0,380,45,1.2,380,22.0,'custom'],
  ['Feijoada (sem acompanhamento)','Feijoada','prepared',200,'1 concha grande',260,18.0,20.0,12.0,6.0,0,680,60,3.5,480,2.0,'custom'],
  ['Lasanha de carne','Meat lasagna','prepared',250,'1 fatia média',380,22.0,33.0,16.0,2.0,5.0,550,180,2.5,360,5.0,'custom'],
  ['Pizza de mussarela (fatia)','Mozzarella pizza slice','prepared',120,'1 fatia grande',290,13.0,34.0,11.0,1.8,3.5,620,220,2.0,180,3.0,'custom'],
  ['Arroz com ovo mexido','Rice with scrambled egg','prepared',200,'1 prato',304,12.5,42.0,10.0,1.8,1.2,200,55,1.5,220,0,'custom'],
  ['Panqueca (2 unidades)','Pancakes (2)','prepared',120,'2 panquecas médias',268,8.0,38.0,9.0,1.2,10.0,480,120,2.0,200,0,'custom'],
  ['Omelete de legumes','Vegetable omelette','prepared',180,'1 omelete grande',230,16.5,8.0,15.5,2.0,3.0,420,90,2.0,380,28.0,'custom'],
  ['Frango ao forno','Oven baked chicken','prepared',150,'1 pedaço médio',255,38.0,2.0,10.0,0,0.5,85,20,1.5,380,2.0,'custom'],
  ['Batata frita (caseira)','French fries homemade','prepared',100,'1 porção',312,3.5,40.0,16.0,3.5,0.3,245,10,0.8,480,5.0,'custom'],
  ['Moqueca de peixe','Brazilian fish stew','prepared',200,'1 porção',285,28.0,8.0,15.0,2.0,4.0,580,90,2.0,520,18.0,'custom'],

  // ── FAST FOOD ─────────────────────────────────────────────────────────────
  ['Hambúrguer artesanal','Artisan burger','fast_food',180,'1 unidade',490,28.0,38.0,23.0,2.0,8.0,780,120,3.5,350,5.0,'custom'],
  ['X-Burguer (McDonald-style)','Cheeseburger','fast_food',120,'1 unidade',325,17.0,32.0,14.0,1.5,7.0,640,140,2.5,250,2.0,'custom'],
  ['Batata frita (fast food P)','Fast food fries small','fast_food',110,'1 porção pequena',320,4.0,43.0,15.0,4.0,0,360,14,1.0,430,6.0,'custom'],
  ['Batata frita (fast food G)','Fast food fries large','fast_food',170,'1 porção grande',490,6.0,66.0,23.0,6.0,0,550,21,1.5,660,9.0,'custom'],
  ['Nuggets de frango (6 un)','Chicken nuggets 6pc','fast_food',107,'6 unidades',271,14.5,17.0,15.5,0.9,0.5,600,14,1.0,300,0,'custom'],
  ['Hot dog com pão','Hot dog with bun','fast_food',130,'1 unidade',310,11.0,28.0,16.0,1.5,5.0,880,50,2.0,210,2.0,'custom'],
  ['Pastel de carne frito','Fried meat pastry','fast_food',120,'1 unidade',355,14.0,33.0,18.0,2.0,2.0,520,35,2.0,180,2.0,'custom'],
  ['Coxinha de frango','Chicken coxinha','fast_food',100,'1 unidade grande',280,10.5,28.0,14.0,1.5,1.5,480,55,1.5,180,0,'custom'],
  ['Esfirra de carne','Meat esfiha','fast_food',90,'1 unidade',250,10.0,28.0,10.0,1.2,2.0,460,45,1.8,160,2.0,'custom'],
  ['Wrap de frango grelhado','Grilled chicken wrap','fast_food',200,'1 unidade',380,28.0,38.0,12.0,3.0,3.5,680,80,2.0,380,8.0,'custom'],
  ['Açaí na tigela (200ml c/ granola)','Açaí bowl with granola','fast_food',250,'1 tigela',350,4.0,50.0,14.0,6.0,30.0,15,45,1.5,280,8.0,'custom'],

  // ── SUPLEMENTOS ───────────────────────────────────────────────────────────
  ['Creatina monoidratada','Creatine monohydrate','proteins',5,'1 colher',0,0,0,0,0,0,0,0,0,0,0,'custom'],
  ['BCAA em pó','BCAA powder','proteins',10,'1 colher',35,7.5,0,0.3,0,0,0,0,0,0,0,'custom'],
  ['Barra de proteína','Protein bar','proteins',60,'1 barra',215,20.0,18.0,7.0,2.0,8.0,200,100,2.5,200,0,'custom'],
  ['Hipercalórico (scoop)','Mass gainer scoop','proteins',60,'1 scoop',240,10.0,46.0,2.0,0.5,15.0,150,200,3.0,300,0,'custom'],
  ['Colágeno em pó','Collagen powder','proteins',10,'1 colher',38,9.0,0,0,0,0,30,0,0,0,0,'custom'],

  // ── MOLHOS E TEMPEROS ─────────────────────────────────────────────────────
  ['Azeite (1 colher)','Olive oil 1 tbsp','fats',15,'1 colher de sopa',133,0,0,15.0,0,0,0,0,0,0,0,'TACO'],
  ['Molho de tomate caseiro','Homemade tomato sauce','prepared',60,'2 colheres de sopa',25,0.9,5.0,0.4,1.0,3.0,160,12,0.5,200,9.0,'custom'],
  ['Ketchup','Ketchup','prepared',17,'1 colher de sopa',18,0.3,4.0,0.1,0.1,3.5,190,3,0.1,70,2.0,'USDA'],
  ['Maionese','Mayonnaise','fats',15,'1 colher de sopa',99,0.1,0.4,10.9,0,0.3,90,2,0,5,0,'TACO'],
  ['Mostarda','Mustard','prepared',5,'1 colher de chá',3,0.2,0.3,0.2,0.2,0.1,55,4,0.1,8,0,'USDA'],
  ['Mel','Honey','sweets',20,'1 colher de sopa',62,0.1,16.8,0,0,16.5,1,1,0.1,11,0.1,'TACO'],
  ['Açúcar cristal','White sugar','sweets',10,'1 colher de sopa',39,0,10.0,0,0,10.0,0,0,0,0,0,'TACO'],
  ['Sal','Salt','prepared',2,'1 pitada',0,0,0,0,0,0,780,0,0,0,0,'TACO'],
];

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const client = await pool.connect();
  try {
    await client.query("SET search_path TO fttcrat");

    // Check if foods already seeded
    const check = await client.query('SELECT COUNT(*) FROM foods');
    const count = parseInt(check.rows[0].count);
    if (count > 0) {
      console.log(`Foods table already has ${count} records. Running upsert...`);
    }

    let inserted = 0, updated = 0;

    for (const f of FOODS) {
      const [name, name_en, category, serving_g, serving_desc,
        calories, protein_g, carbs_g, fats_g, fiber_g, sugar_g,
        sodium_mg, calcium_mg, iron_mg, potassium_mg, vitamin_c_mg, source] = f;

      const res = await client.query(
        `INSERT INTO foods
          (name, name_en, category, serving_g, serving_desc,
           calories, protein_g, carbs_g, fats_g, fiber_g, sugar_g,
           sodium_mg, calcium_mg, iron_mg, potassium_mg, vitamin_c_mg, source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [name, name_en, category, serving_g, serving_desc,
         calories, protein_g, carbs_g, fats_g, fiber_g, sugar_g,
         sodium_mg, calcium_mg, iron_mg, potassium_mg, vitamin_c_mg, source]
      );

      if (res.rows.length > 0) inserted++;
      else updated++;
    }

    console.log(`✅ Done! Inserted: ${inserted} | Skipped (already exist): ${updated}`);
    console.log(`Total foods in DB: ${count + inserted}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
