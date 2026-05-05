export type AlergenoId =
  | 'cereales' | 'lacteos' | 'huevo' | 'pescado' | 'cacahuetes'
  | 'soja' | 'frutosSecos' | 'crustaceos' | 'moluscos'
  | 'apio' | 'mostaza' | 'sesamo' | 'altramuz' | 'sulfitos'

export type CategoriaIngrediente =
  | 'harinas' | 'pasta-arroz' | 'lacteos' | 'huevos'
  | 'carnes' | 'pescados' | 'mariscos' | 'verduras'
  | 'frutas' | 'legumbres' | 'frutos-secos' | 'especias'
  | 'aceites' | 'salsas' | 'bebidas' | 'dulces' | 'otros'

export interface DatoIngrediente {
  nombre: string
  aliases: string[]
  alergenos: AlergenoId[]
  categoria: CategoriaIngrediente
}

export const INGREDIENTES_COMUNES: DatoIngrediente[] = [

  // ═══════════════════════════════════════════════════════
  // HARINAS Y CEREALES
  // ═══════════════════════════════════════════════════════
  { nombre: 'Harina de trigo', aliases: ['harina', 'flour', 'wheat flour', 'harina blanca', 'harina de fuerza', 'farina'], alergenos: ['cereales'], categoria: 'harinas' },
  { nombre: 'Harina integral', aliases: ['harina integral de trigo', 'whole wheat flour', 'wholemeal flour'], alergenos: ['cereales'], categoria: 'harinas' },
  { nombre: 'Harina de maíz', aliases: ['maizena', 'cornstarch', 'corn flour', 'almidón de maíz', 'fécula de maíz'], alergenos: [], categoria: 'harinas' },
  { nombre: 'Harina de arroz', aliases: ['rice flour', 'farina di riso'], alergenos: [], categoria: 'harinas' },
  { nombre: 'Harina de espelta', aliases: ['spelt flour', 'espelta'], alergenos: ['cereales'], categoria: 'harinas' },
  { nombre: 'Harina de centeno', aliases: ['rye flour', 'centeno'], alergenos: ['cereales'], categoria: 'harinas' },
  { nombre: 'Avena', aliases: ['oats', 'copos de avena', 'oatmeal', 'harina de avena', 'rolled oats', 'porridge'], alergenos: ['cereales'], categoria: 'harinas' },
  { nombre: 'Pan rallado', aliases: ['breadcrumbs', 'panko', 'pan rayado'], alergenos: ['cereales'], categoria: 'harinas' },
  { nombre: 'Pan', aliases: ['bread', 'pan de molde', 'barra de pan', 'baguette', 'chapata'], alergenos: ['cereales'], categoria: 'harinas' },
  { nombre: 'Levadura', aliases: ['yeast', 'levadura de panadero', 'levadura seca', 'dry yeast', 'levadura fresca'], alergenos: [], categoria: 'harinas' },
  { nombre: 'Levadura química', aliases: ['baking powder', 'royal', 'impulsor', 'polvo de hornear'], alergenos: [], categoria: 'harinas' },
  { nombre: 'Bicarbonato sódico', aliases: ['bicarbonato', 'baking soda', 'sodium bicarbonate'], alergenos: [], categoria: 'harinas' },

  // ═══════════════════════════════════════════════════════
  // PASTA, ARROZ Y CEREALES
  // ═══════════════════════════════════════════════════════
  { nombre: 'Espaguetis', aliases: ['spaghetti', 'espaguetti', 'pasta larga'], alergenos: ['cereales'], categoria: 'pasta-arroz' },
  { nombre: 'Macarrones', aliases: ['macaroni', 'pasta corta', 'penne', 'rigatoni'], alergenos: ['cereales'], categoria: 'pasta-arroz' },
  { nombre: 'Tallarines', aliases: ['tagliatelle', 'fettuccine', 'noodles', 'fideos'], alergenos: ['cereales'], categoria: 'pasta-arroz' },
  { nombre: 'Láminas de lasaña', aliases: ['lasagna sheets', 'lasagne', 'lasaña'], alergenos: ['cereales'], categoria: 'pasta-arroz' },
  { nombre: 'Fideos', aliases: ['noodles', 'fideos finos', 'vermicelli', 'cabello de ángel'], alergenos: ['cereales'], categoria: 'pasta-arroz' },
  { nombre: 'Arroz blanco', aliases: ['rice', 'white rice', 'arroz'], alergenos: [], categoria: 'pasta-arroz' },
  { nombre: 'Arroz integral', aliases: ['brown rice', 'whole grain rice', 'arroz moreno'], alergenos: [], categoria: 'pasta-arroz' },
  { nombre: 'Arroz bomba', aliases: ['bomba rice', 'arroz para paella', 'paella rice'], alergenos: [], categoria: 'pasta-arroz' },
  { nombre: 'Arroz basmati', aliases: ['basmati rice', 'basmati'], alergenos: [], categoria: 'pasta-arroz' },
  { nombre: 'Quinoa', aliases: ['quinua', 'quinoá'], alergenos: [], categoria: 'pasta-arroz' },
  { nombre: 'Cuscús', aliases: ['couscous', 'cous cous'], alergenos: ['cereales'], categoria: 'pasta-arroz' },
  { nombre: 'Bulgur', aliases: ['bulgur wheat', 'trigo bulgur'], alergenos: ['cereales'], categoria: 'pasta-arroz' },

  // ═══════════════════════════════════════════════════════
  // LÁCTEOS
  // ═══════════════════════════════════════════════════════
  { nombre: 'Leche', aliases: ['milk', 'whole milk', 'leche entera', 'llet', 'leche de vaca'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Leche desnatada', aliases: ['skim milk', 'leche sin grasa', 'skimmed milk'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Leche semidesnatada', aliases: ['semi-skimmed milk', 'semi skim'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Nata para cocinar', aliases: ['crema de leche', 'cream', 'heavy cream', 'nata líquida', 'cooking cream'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Nata para montar', aliases: ['whipping cream', 'heavy whipping cream', 'nata montada'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Mantequilla', aliases: ['butter', 'beurre', 'burro', 'manteca'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Queso parmesano', aliases: ['parmesan', 'parmigiano', 'parmigiano reggiano'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Mozzarella', aliases: ['mozzarella cheese', 'queso mozzarela', 'mozarela'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Queso manchego', aliases: ['manchego', 'manchego cheese'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Queso crema', aliases: ['cream cheese', 'philadelphia', 'queso para untar'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Ricotta', aliases: ['ricota', 'requesón', 'ricotta cheese'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Queso cheddar', aliases: ['cheddar', 'cheddar cheese'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Queso de cabra', aliases: ['goat cheese', 'chèvre', 'queso cabra'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Queso azul', aliases: ['blue cheese', 'roquefort', 'gorgonzola', 'cabrales'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Queso emmental', aliases: ['emmental', 'swiss cheese', 'gruyère', 'gruyere'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Yogur natural', aliases: ['yogurt', 'yoghurt', 'yogur', 'plain yogurt'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Yogur griego', aliases: ['greek yogurt', 'yogur griego'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Leche condensada', aliases: ['condensed milk', 'leche condensada'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Leche evaporada', aliases: ['evaporated milk'], alergenos: ['lacteos'], categoria: 'lacteos' },
  { nombre: 'Leche de coco', aliases: ['coconut milk', 'leche coco'], alergenos: [], categoria: 'lacteos' },
  { nombre: 'Leche de avena', aliases: ['oat milk', 'bebida de avena'], alergenos: ['cereales'], categoria: 'lacteos' },
  { nombre: 'Leche de almendras', aliases: ['almond milk', 'bebida de almendras'], alergenos: ['frutosSecos'], categoria: 'lacteos' },
  { nombre: 'Leche de soja', aliases: ['soy milk', 'bebida de soja'], alergenos: ['soja'], categoria: 'lacteos' },

  // ═══════════════════════════════════════════════════════
  // HUEVOS
  // ═══════════════════════════════════════════════════════
  { nombre: 'Huevo', aliases: ['egg', 'huevos', 'eggs', 'ou', 'uovo'], alergenos: ['huevo'], categoria: 'huevos' },
  { nombre: 'Clara de huevo', aliases: ['egg white', 'claras', 'albumina'], alergenos: ['huevo'], categoria: 'huevos' },
  { nombre: 'Yema de huevo', aliases: ['egg yolk', 'yemas'], alergenos: ['huevo'], categoria: 'huevos' },

  // ═══════════════════════════════════════════════════════
  // CARNES
  // ═══════════════════════════════════════════════════════
  { nombre: 'Pechuga de pollo', aliases: ['chicken breast', 'pollo', 'chicken', 'filete de pollo'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Muslo de pollo', aliases: ['chicken thigh', 'contramuslo', 'chicken leg'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Pollo entero', aliases: ['whole chicken', 'pollo de corral'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Pavo', aliases: ['turkey', 'pechuga de pavo', 'turkey breast'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Filete de ternera', aliases: ['beef steak', 'ternera', 'beef', 'bistec', 'steak', 'solomillo'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Carne picada de ternera', aliases: ['ground beef', 'minced beef', 'carne molida', 'picadillo'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Carne picada mixta', aliases: ['mixed mince', 'carne picada cerdo y ternera'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Lomo de cerdo', aliases: ['pork loin', 'cerdo', 'pork', 'filete de cerdo'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Costillas de cerdo', aliases: ['pork ribs', 'ribs', 'costillar'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Panceta', aliases: ['bacon', 'pancetta', 'tocino', 'beicon'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Jamón serrano', aliases: ['serrano ham', 'jamón', 'jamon'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Jamón cocido', aliases: ['cooked ham', 'jamón york', 'jamón dulce', 'ham'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Chorizo', aliases: ['spanish chorizo', 'chorizo español'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Salchicha', aliases: ['sausage', 'salchichas', 'frankfurter', 'hot dog'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Cordero', aliases: ['lamb', 'carne de cordero', 'pierna de cordero', 'lamb leg'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Conejo', aliases: ['rabbit', 'carne de conejo'], alergenos: [], categoria: 'carnes' },
  { nombre: 'Pato', aliases: ['duck', 'magret de pato', 'duck breast'], alergenos: [], categoria: 'carnes' },

  // ═══════════════════════════════════════════════════════
  // PESCADOS
  // ═══════════════════════════════════════════════════════
  { nombre: 'Salmón', aliases: ['salmon', 'salmón fresco', 'fresh salmon', 'salmón ahumado', 'smoked salmon'], alergenos: ['pescado'], categoria: 'pescados' },
  { nombre: 'Atún', aliases: ['tuna', 'atún fresco', 'atún en lata', 'canned tuna', 'bonito'], alergenos: ['pescado'], categoria: 'pescados' },
  { nombre: 'Bacalao', aliases: ['cod', 'bacalao fresco', 'bacalao salado', 'salt cod'], alergenos: ['pescado'], categoria: 'pescados' },
  { nombre: 'Merluza', aliases: ['hake', 'merluza fresca', 'filete de merluza'], alergenos: ['pescado'], categoria: 'pescados' },
  { nombre: 'Lubina', aliases: ['sea bass', 'robalo', 'llobarro'], alergenos: ['pescado'], categoria: 'pescados' },
  { nombre: 'Dorada', aliases: ['sea bream', 'gilt-head bream', 'orada'], alergenos: ['pescado'], categoria: 'pescados' },
  { nombre: 'Sardina', aliases: ['sardine', 'sardinas', 'sardines'], alergenos: ['pescado'], categoria: 'pescados' },
  { nombre: 'Trucha', aliases: ['trout', 'trucha de río'], alergenos: ['pescado'], categoria: 'pescados' },
  { nombre: 'Rape', aliases: ['monkfish', 'rape fresco'], alergenos: ['pescado'], categoria: 'pescados' },
  { nombre: 'Anchoa', aliases: ['anchovy', 'boquerón', 'anchoas en aceite', 'anchovies'], alergenos: ['pescado'], categoria: 'pescados' },
  { nombre: 'Caballa', aliases: ['mackerel', 'verdel'], alergenos: ['pescado'], categoria: 'pescados' },

  // ═══════════════════════════════════════════════════════
  // MARISCOS
  // ═══════════════════════════════════════════════════════
  { nombre: 'Gamba', aliases: ['shrimp', 'prawn', 'gambas', 'langostino pequeño'], alergenos: ['crustaceos'], categoria: 'mariscos' },
  { nombre: 'Langostino', aliases: ['king prawn', 'tiger prawn', 'langostinos'], alergenos: ['crustaceos'], categoria: 'mariscos' },
  { nombre: 'Cigala', aliases: ['crayfish', 'norway lobster', 'scampi'], alergenos: ['crustaceos'], categoria: 'mariscos' },
  { nombre: 'Bogavante', aliases: ['lobster', 'langosta', 'homard'], alergenos: ['crustaceos'], categoria: 'mariscos' },
  { nombre: 'Cangrejo', aliases: ['crab', 'surimi', 'palitos de cangrejo'], alergenos: ['crustaceos'], categoria: 'mariscos' },
  { nombre: 'Mejillón', aliases: ['mussel', 'mejillones', 'mussels', 'musclo'], alergenos: ['moluscos'], categoria: 'mariscos' },
  { nombre: 'Calamar', aliases: ['squid', 'calamares', 'chipirón', 'pota'], alergenos: ['moluscos'], categoria: 'mariscos' },
  { nombre: 'Pulpo', aliases: ['octopus', 'pulpo a feira', 'pop'], alergenos: ['moluscos'], categoria: 'mariscos' },
  { nombre: 'Almeja', aliases: ['clam', 'almejas', 'clams', 'cloïssa'], alergenos: ['moluscos'], categoria: 'mariscos' },
  { nombre: 'Vieira', aliases: ['scallop', 'vieiras', 'scallops'], alergenos: ['moluscos'], categoria: 'mariscos' },
  { nombre: 'Sepia', aliases: ['cuttlefish', 'jibia', 'sèpia'], alergenos: ['moluscos'], categoria: 'mariscos' },

  // ═══════════════════════════════════════════════════════
  // VERDURAS Y HORTALIZAS
  // ═══════════════════════════════════════════════════════
  { nombre: 'Tomate', aliases: ['tomato', 'tomàquet', 'jitomate'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Tomate frito', aliases: ['tomato sauce', 'salsa de tomate', 'tomate triturado', 'passata'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Cebolla', aliases: ['onion', 'ceba', 'cebolla blanca', 'cebolla dulce'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Cebolla morada', aliases: ['red onion', 'cebolla roja'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Cebolleta', aliases: ['spring onion', 'scallion', 'cebollín', 'cebollino'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Ajo', aliases: ['garlic', 'all', 'diente de ajo', 'garlic clove'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Puerro', aliases: ['leek', 'porro', 'puerros'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Zanahoria', aliases: ['carrot', 'pastanaga', 'zanahorias'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Patata', aliases: ['potato', 'papa', 'patatas', 'potatoes'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Boniato', aliases: ['sweet potato', 'batata', 'patata dulce'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Pimiento rojo', aliases: ['red pepper', 'red bell pepper', 'pimentón', 'pebrot'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Pimiento verde', aliases: ['green pepper', 'green bell pepper'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Calabacín', aliases: ['zucchini', 'courgette', 'calabacines'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Berenjena', aliases: ['eggplant', 'aubergine', 'albergínia'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Calabaza', aliases: ['pumpkin', 'squash', 'butternut', 'carbassa'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Brócoli', aliases: ['broccoli', 'brocoli', 'brécol'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Coliflor', aliases: ['cauliflower', 'col-i-flor'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Espinaca', aliases: ['spinach', 'espinacas', 'espinacs'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Lechuga', aliases: ['lettuce', 'enciam', 'lechuga romana', 'romaine'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Rúcula', aliases: ['arugula', 'rocket', 'rúcola'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Canónigos', aliases: ['lamb lettuce', 'corn salad', 'valerianella'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Acelga', aliases: ['chard', 'swiss chard', 'acelgas', 'bleda'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Col', aliases: ['cabbage', 'repollo', 'col lombarda', 'red cabbage'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Col rizada', aliases: ['kale', 'berza'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Champiñón', aliases: ['mushroom', 'button mushroom', 'champiñones', 'bolet'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Seta', aliases: ['mushroom', 'wild mushroom', 'setas', 'boletus', 'shiitake', 'portobello'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Pepino', aliases: ['cucumber', 'cogombre'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Aguacate', aliases: ['avocado', 'alvocat', 'palta'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Maíz dulce', aliases: ['corn', 'sweet corn', 'elote', 'maíz', 'maíz en lata'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Guisante', aliases: ['pea', 'peas', 'guisantes', 'petit pois', 'pèsol'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Judía verde', aliases: ['green bean', 'french bean', 'judías verdes', 'ejote', 'mongeta'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Alcachofa', aliases: ['artichoke', 'alcachofas', 'carxofa'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Espárrago', aliases: ['asparagus', 'espárragos', 'espárrago verde', 'espárrago blanco'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Remolacha', aliases: ['beetroot', 'beet', 'remolatxa'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Nabo', aliases: ['turnip', 'nap'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Apio', aliases: ['celery', 'àpit', 'tallo de apio'], alergenos: ['apio'], categoria: 'verduras' },
  { nombre: 'Hinojo', aliases: ['fennel', 'fonoll'], alergenos: [], categoria: 'verduras' },
  { nombre: 'Jengibre', aliases: ['ginger', 'gingebre', 'raíz de jengibre'], alergenos: [], categoria: 'verduras' },

  // ═══════════════════════════════════════════════════════
  // FRUTAS
  // ═══════════════════════════════════════════════════════
  { nombre: 'Limón', aliases: ['lemon', 'llimona', 'zumo de limón', 'lemon juice'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Lima', aliases: ['lime', 'llima', 'zumo de lima'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Naranja', aliases: ['orange', 'taronja', 'zumo de naranja', 'orange juice'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Manzana', aliases: ['apple', 'poma'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Pera', aliases: ['pear', 'pera conferencia'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Plátano', aliases: ['banana', 'plàtan', 'guineo', 'banano'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Fresa', aliases: ['strawberry', 'fresas', 'maduixa', 'frutilla'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Frambuesa', aliases: ['raspberry', 'frambuesas', 'gerd'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Arándano', aliases: ['blueberry', 'blueberries', 'arándanos', 'nabiu'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Uva', aliases: ['grape', 'grapes', 'uvas', 'raïm'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Melocotón', aliases: ['peach', 'durazno', 'préssec'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Mango', aliases: ['mango', 'mango fresco'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Piña', aliases: ['pineapple', 'ananas', 'pinya'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Sandía', aliases: ['watermelon', 'síndria'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Melón', aliases: ['melon', 'cantaloupe', 'meló'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Cereza', aliases: ['cherry', 'cherries', 'cerezas', 'cirera'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Higo', aliases: ['fig', 'higos', 'figa', 'breva'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Dátil', aliases: ['date', 'dates', 'dátiles', 'dàtil'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Coco', aliases: ['coconut', 'coco rallado', 'desiccated coconut'], alergenos: [], categoria: 'frutas' },
  { nombre: 'Pasas', aliases: ['raisins', 'uvas pasas', 'sultanas', 'panses'], alergenos: [], categoria: 'frutas' },

  // ═══════════════════════════════════════════════════════
  // LEGUMBRES
  // ═══════════════════════════════════════════════════════
  { nombre: 'Garbanzos', aliases: ['chickpeas', 'garbanzo beans', 'cigrons'], alergenos: [], categoria: 'legumbres' },
  { nombre: 'Lentejas', aliases: ['lentils', 'llenties', 'lentejas pardinas', 'red lentils'], alergenos: [], categoria: 'legumbres' },
  { nombre: 'Alubias blancas', aliases: ['white beans', 'cannellini', 'judías blancas', 'frijoles blancos', 'mongetes'], alergenos: [], categoria: 'legumbres' },
  { nombre: 'Alubias rojas', aliases: ['kidney beans', 'red beans', 'judías rojas', 'frijoles rojos'], alergenos: [], categoria: 'legumbres' },
  { nombre: 'Alubias negras', aliases: ['black beans', 'frijoles negros', 'judías negras'], alergenos: [], categoria: 'legumbres' },
  { nombre: 'Habas', aliases: ['broad beans', 'fava beans', 'faves'], alergenos: [], categoria: 'legumbres' },
  { nombre: 'Edamame', aliases: ['soja verde', 'soybeans', 'edamame beans'], alergenos: ['soja'], categoria: 'legumbres' },
  { nombre: 'Tofu', aliases: ['bean curd', 'tofu firme', 'tofu sedoso', 'silken tofu'], alergenos: ['soja'], categoria: 'legumbres' },

  // ═══════════════════════════════════════════════════════
  // FRUTOS SECOS Y SEMILLAS
  // ═══════════════════════════════════════════════════════
  { nombre: 'Almendra', aliases: ['almond', 'almonds', 'almendras', 'ametlla'], alergenos: ['frutosSecos'], categoria: 'frutos-secos' },
  { nombre: 'Nuez', aliases: ['walnut', 'walnuts', 'nueces', 'nou'], alergenos: ['frutosSecos'], categoria: 'frutos-secos' },
  { nombre: 'Avellana', aliases: ['hazelnut', 'hazelnuts', 'avellanas', 'avellana tostada'], alergenos: ['frutosSecos'], categoria: 'frutos-secos' },
  { nombre: 'Pistacho', aliases: ['pistachio', 'pistachios', 'pistachos', 'festuc'], alergenos: ['frutosSecos'], categoria: 'frutos-secos' },
  { nombre: 'Anacardo', aliases: ['cashew', 'cashew nut', 'anacardos'], alergenos: ['frutosSecos'], categoria: 'frutos-secos' },
  { nombre: 'Piñón', aliases: ['pine nut', 'pine nuts', 'piñones', 'pinyó'], alergenos: ['frutosSecos'], categoria: 'frutos-secos' },
  { nombre: 'Cacahuete', aliases: ['peanut', 'peanuts', 'cacahuetes', 'maní', 'cacauet'], alergenos: ['cacahuetes'], categoria: 'frutos-secos' },
  { nombre: 'Semillas de sésamo', aliases: ['sesame seeds', 'ajonjolí', 'sésamo', 'sèsam'], alergenos: ['sesamo'], categoria: 'frutos-secos' },
  { nombre: 'Semillas de chía', aliases: ['chia seeds', 'chía'], alergenos: [], categoria: 'frutos-secos' },
  { nombre: 'Semillas de lino', aliases: ['flax seeds', 'linaza', 'flaxseed', 'llavors de lli'], alergenos: [], categoria: 'frutos-secos' },
  { nombre: 'Semillas de girasol', aliases: ['sunflower seeds', 'pipas', 'pipas de girasol'], alergenos: [], categoria: 'frutos-secos' },
  { nombre: 'Semillas de calabaza', aliases: ['pumpkin seeds', 'pepitas'], alergenos: [], categoria: 'frutos-secos' },

  // ═══════════════════════════════════════════════════════
  // ESPECIAS Y HIERBAS
  // ═══════════════════════════════════════════════════════
  { nombre: 'Sal', aliases: ['salt', 'sal marina', 'sea salt', 'sal gruesa', 'flor de sal'], alergenos: [], categoria: 'especias' },
  { nombre: 'Pimienta negra', aliases: ['black pepper', 'pepper', 'pimienta', 'pebre negre'], alergenos: [], categoria: 'especias' },
  { nombre: 'Pimentón', aliases: ['paprika', 'pimentón dulce', 'pimentón picante', 'pimentón de la Vera', 'smoked paprika'], alergenos: [], categoria: 'especias' },
  { nombre: 'Comino', aliases: ['cumin', 'comí'], alergenos: [], categoria: 'especias' },
  { nombre: 'Cúrcuma', aliases: ['turmeric', 'curcuma'], alergenos: [], categoria: 'especias' },
  { nombre: 'Canela', aliases: ['cinnamon', 'canela en rama', 'canela en polvo', 'canyella'], alergenos: [], categoria: 'especias' },
  { nombre: 'Nuez moscada', aliases: ['nutmeg', 'nou moscada'], alergenos: [], categoria: 'especias' },
  { nombre: 'Orégano', aliases: ['oregano', 'orégano seco', 'orenga'], alergenos: [], categoria: 'especias' },
  { nombre: 'Perejil', aliases: ['parsley', 'julivert', 'perejil fresco', 'fresh parsley'], alergenos: [], categoria: 'especias' },
  { nombre: 'Albahaca', aliases: ['basil', 'basil leaves', 'alfàbrega'], alergenos: [], categoria: 'especias' },
  { nombre: 'Cilantro', aliases: ['coriander', 'cilantro fresco', 'coriandre'], alergenos: [], categoria: 'especias' },
  { nombre: 'Romero', aliases: ['rosemary', 'romaní'], alergenos: [], categoria: 'especias' },
  { nombre: 'Tomillo', aliases: ['thyme', 'farigola', 'tomillo fresco'], alergenos: [], categoria: 'especias' },
  { nombre: 'Laurel', aliases: ['bay leaf', 'bay leaves', 'hojas de laurel', 'llorer'], alergenos: [], categoria: 'especias' },
  { nombre: 'Menta', aliases: ['mint', 'hierbabuena', 'peppermint', 'menta'], alergenos: [], categoria: 'especias' },
  { nombre: 'Eneldo', aliases: ['dill', 'anet'], alergenos: [], categoria: 'especias' },
  { nombre: 'Azafrán', aliases: ['saffron', 'safrà'], alergenos: [], categoria: 'especias' },
  { nombre: 'Clavo', aliases: ['clove', 'cloves', 'clavos de olor', 'clau d\'espècia'], alergenos: [], categoria: 'especias' },
  { nombre: 'Cayena', aliases: ['cayenne', 'cayenne pepper', 'chile en polvo', 'chili powder'], alergenos: [], categoria: 'especias' },
  { nombre: 'Guindilla', aliases: ['chili', 'chili pepper', 'hot pepper', 'chile', 'ají'], alergenos: [], categoria: 'especias' },
  { nombre: 'Curry', aliases: ['curry powder', 'curri'], alergenos: [], categoria: 'especias' },
  { nombre: 'Vainilla', aliases: ['vanilla', 'extracto de vainilla', 'vanilla extract', 'vainilla en rama'], alergenos: [], categoria: 'especias' },

  // ═══════════════════════════════════════════════════════
  // ACEITES Y GRASAS
  // ═══════════════════════════════════════════════════════
  { nombre: 'Aceite de oliva virgen extra', aliases: ['AOVE', 'extra virgin olive oil', 'EVOO', 'aceite de oliva', 'olive oil', 'oli d\'oliva'], alergenos: [], categoria: 'aceites' },
  { nombre: 'Aceite de oliva', aliases: ['olive oil', 'aceite de oliva suave'], alergenos: [], categoria: 'aceites' },
  { nombre: 'Aceite de girasol', aliases: ['sunflower oil', 'oli de gira-sol'], alergenos: [], categoria: 'aceites' },
  { nombre: 'Aceite de coco', aliases: ['coconut oil', 'oli de coco'], alergenos: [], categoria: 'aceites' },
  { nombre: 'Aceite de sésamo', aliases: ['sesame oil', 'oli de sèsam'], alergenos: ['sesamo'], categoria: 'aceites' },
  { nombre: 'Manteca de cerdo', aliases: ['lard', 'manteca', 'saïm'], alergenos: [], categoria: 'aceites' },

  // ═══════════════════════════════════════════════════════
  // SALSAS Y CONDIMENTOS
  // ═══════════════════════════════════════════════════════
  { nombre: 'Salsa de soja', aliases: ['soy sauce', 'soja', 'tamari', 'salsa de soya'], alergenos: ['soja', 'cereales'], categoria: 'salsas' },
  { nombre: 'Vinagre de vino', aliases: ['wine vinegar', 'red wine vinegar', 'vinagre'], alergenos: ['sulfitos'], categoria: 'salsas' },
  { nombre: 'Vinagre de manzana', aliases: ['apple cider vinegar', 'vinagre de sidra'], alergenos: [], categoria: 'salsas' },
  { nombre: 'Vinagre balsámico', aliases: ['balsamic vinegar', 'vinagre de Módena'], alergenos: ['sulfitos'], categoria: 'salsas' },
  { nombre: 'Mostaza', aliases: ['mustard', 'mostaza de Dijon', 'dijon mustard', 'mostassa'], alergenos: ['mostaza'], categoria: 'salsas' },
  { nombre: 'Ketchup', aliases: ['catsup', 'kétchup', 'tomato ketchup'], alergenos: [], categoria: 'salsas' },
  { nombre: 'Mayonesa', aliases: ['mayonnaise', 'mayo', 'maionesa'], alergenos: ['huevo'], categoria: 'salsas' },
  { nombre: 'Salsa Worcestershire', aliases: ['worcestershire sauce', 'salsa inglesa', 'salsa perrins'], alergenos: ['pescado'], categoria: 'salsas' },
  { nombre: 'Salsa de tomate', aliases: ['tomato sauce', 'tomato passata', 'sofrito de tomate'], alergenos: [], categoria: 'salsas' },
  { nombre: 'Pesto', aliases: ['pesto genovese', 'basil pesto', 'salsa pesto'], alergenos: ['frutosSecos', 'lacteos'], categoria: 'salsas' },
  { nombre: 'Miel', aliases: ['honey', 'mel'], alergenos: [], categoria: 'salsas' },
  { nombre: 'Tahini', aliases: ['tahina', 'pasta de sésamo', 'sesame paste'], alergenos: ['sesamo'], categoria: 'salsas' },
  { nombre: 'Pasta miso', aliases: ['miso paste', 'miso', 'miso rojo', 'miso blanco'], alergenos: ['soja'], categoria: 'salsas' },
  { nombre: 'Sriracha', aliases: ['salsa sriracha', 'salsa picante'], alergenos: [], categoria: 'salsas' },
  { nombre: 'Tabasco', aliases: ['hot sauce', 'salsa tabasco'], alergenos: [], categoria: 'salsas' },

  // ═══════════════════════════════════════════════════════
  // BEBIDAS Y LÍQUIDOS
  // ═══════════════════════════════════════════════════════
  { nombre: 'Agua', aliases: ['water', 'aigua'], alergenos: [], categoria: 'bebidas' },
  { nombre: 'Caldo de pollo', aliases: ['chicken broth', 'chicken stock', 'caldo', 'brou de pollastre'], alergenos: [], categoria: 'bebidas' },
  { nombre: 'Caldo de verduras', aliases: ['vegetable broth', 'vegetable stock', 'brou de verdures'], alergenos: [], categoria: 'bebidas' },
  { nombre: 'Caldo de pescado', aliases: ['fish broth', 'fish stock', 'fumet', 'brou de peix'], alergenos: ['pescado'], categoria: 'bebidas' },
  { nombre: 'Vino tinto', aliases: ['red wine', 'vi negre'], alergenos: ['sulfitos'], categoria: 'bebidas' },
  { nombre: 'Vino blanco', aliases: ['white wine', 'vi blanc'], alergenos: ['sulfitos'], categoria: 'bebidas' },
  { nombre: 'Cerveza', aliases: ['beer', 'cervesa', 'birra'], alergenos: ['cereales'], categoria: 'bebidas' },
  { nombre: 'Zumo de limón', aliases: ['lemon juice', 'suc de llimona'], alergenos: [], categoria: 'bebidas' },
  { nombre: 'Zumo de naranja', aliases: ['orange juice', 'suc de taronja'], alergenos: [], categoria: 'bebidas' },
  { nombre: 'Café', aliases: ['coffee', 'cafè', 'espresso'], alergenos: [], categoria: 'bebidas' },

  // ═══════════════════════════════════════════════════════
  // DULCES Y REPOSTERÍA
  // ═══════════════════════════════════════════════════════
  { nombre: 'Azúcar', aliases: ['sugar', 'azúcar blanco', 'white sugar', 'sucre'], alergenos: [], categoria: 'dulces' },
  { nombre: 'Azúcar moreno', aliases: ['brown sugar', 'azúcar integral', 'sucre moreno', 'panela'], alergenos: [], categoria: 'dulces' },
  { nombre: 'Azúcar glas', aliases: ['powdered sugar', 'icing sugar', 'azúcar impalpable', 'azúcar lustre'], alergenos: [], categoria: 'dulces' },
  { nombre: 'Chocolate negro', aliases: ['dark chocolate', 'chocolate 70%', 'xocolata negra', 'bittersweet chocolate'], alergenos: [], categoria: 'dulces' },
  { nombre: 'Chocolate con leche', aliases: ['milk chocolate', 'xocolata amb llet'], alergenos: ['lacteos'], categoria: 'dulces' },
  { nombre: 'Chocolate blanco', aliases: ['white chocolate', 'xocolata blanca'], alergenos: ['lacteos'], categoria: 'dulces' },
  { nombre: 'Cacao en polvo', aliases: ['cocoa powder', 'cacao puro', 'unsweetened cocoa', 'cacau'], alergenos: [], categoria: 'dulces' },
  { nombre: 'Mermelada', aliases: ['jam', 'marmalade', 'confitura', 'melmelada'], alergenos: [], categoria: 'dulces' },
  { nombre: 'Sirope de arce', aliases: ['maple syrup', 'xarop d\'auró'], alergenos: [], categoria: 'dulces' },
  { nombre: 'Gelatina', aliases: ['gelatin', 'gelatina en láminas', 'gelatina en polvo', 'cola de pescado'], alergenos: [], categoria: 'dulces' },

  // ═══════════════════════════════════════════════════════
  // OTROS
  // ═══════════════════════════════════════════════════════
  { nombre: 'Altramuz', aliases: ['lupin', 'lupini', 'harina de altramuz', 'tramussos'], alergenos: ['altramuz'], categoria: 'otros' },
  { nombre: 'Tomate seco', aliases: ['sun-dried tomato', 'tomates secos', 'tomàquet sec'], alergenos: [], categoria: 'otros' },
  { nombre: 'Alcaparras', aliases: ['capers', 'tàperes'], alergenos: [], categoria: 'otros' },
  { nombre: 'Aceitunas', aliases: ['olives', 'olive', 'aceitunas negras', 'aceitunas verdes', 'olives'], alergenos: [], categoria: 'otros' },
  { nombre: 'Pepinillo', aliases: ['pickle', 'gherkin', 'pepinillos en vinagre', 'cornichon'], alergenos: [], categoria: 'otros' },
  { nombre: 'Masa quebrada', aliases: ['shortcrust pastry', 'pasta brisa', 'masa brisa'], alergenos: ['cereales', 'lacteos'], categoria: 'otros' },
  { nombre: 'Masa de hojaldre', aliases: ['puff pastry', 'hojaldre', 'pasta de full'], alergenos: ['cereales', 'lacteos'], categoria: 'otros' },
  { nombre: 'Tortilla de trigo', aliases: ['wheat tortilla', 'tortilla wrap', 'wrap'], alergenos: ['cereales'], categoria: 'otros' },
  { nombre: 'Tortilla de maíz', aliases: ['corn tortilla', 'tortilla mexicana'], alergenos: [], categoria: 'otros' },
]

export function buscarIngredientes(
  query: string,
  max: number = 8
): DatoIngrediente[] {
  const q = query.toLowerCase().trim()
  if (q.length < 2) return []

  return INGREDIENTES_COMUNES
    .filter(i =>
      i.nombre.toLowerCase().includes(q) ||
      i.aliases.some(a => a.toLowerCase().includes(q))
    )
    .slice(0, max)
}

export function buscarPorCategoria(
  categoria: CategoriaIngrediente
): DatoIngrediente[] {
  return INGREDIENTES_COMUNES.filter(i => i.categoria === categoria)
}

export function obtenerIngrediente(
  nombre: string
): DatoIngrediente | undefined {
  const q = nombre.toLowerCase().trim()
  return INGREDIENTES_COMUNES.find(i =>
    i.nombre.toLowerCase() === q ||
    i.aliases.some(a => a.toLowerCase() === q)
  )
}

export function detectarAlergenos(
  nombresIngredientes: string[]
): AlergenoId[] {
  const alergenosSet = new Set<AlergenoId>()

  nombresIngredientes.forEach(nombre => {
    const ingrediente = obtenerIngrediente(nombre)
    if (ingrediente) {
      ingrediente.alergenos.forEach(a => alergenosSet.add(a))
    }
  })

  return Array.from(alergenosSet)
}

export const NOMBRES_INGREDIENTES = INGREDIENTES_COMUNES.map(i => i.nombre)
