// lib/currency.js
// ============================================================
// SISTEMA DE MONEDAS POR PAÍS — Conversión y formato local
// Soporta: Colombia, México, Brasil, Chile, Perú, Argentina,
//          USA, España, Ecuador, Panamá
// ============================================================

export const COUNTRIES = {
  CO: {
    name: "Colombia",
    currency: "COP",
    symbol: "$",
    locale: "es-CO",
    rate: 4200,
    decimals: 0,
    format: (amount) => `$${Math.round(amount).toLocaleString("es-CO")}`,
    flag: "🇨🇴",
    whatsappPrefix: "+57",
    shipping: "Envío gratis a toda Colombia (3-7 días hábiles)",
    cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga"],
    paymentMethods: "Nequi, Daviplata, PSE, tarjeta de crédito, contraentrega",
    contraentrega: true,
    slang: ["parce", "bacano", "chimba", "llave"],
    expressions: ["¡Qué bacano!", "¡Parce, esto está chimba!", "¡De una, llave!"],
    names: ["María García", "Carlos Rodríguez", "Valentina Martínez", "Andrés López", "Camila Hernández", "Santiago Gómez", "Laura Díaz", "Juan Pablo Restrepo"],
  },
  MX: {
    name: "México",
    currency: "MXN",
    symbol: "$",
    locale: "es-MX",
    rate: 17.5,
    decimals: 0,
    format: (amount) => `$${Math.round(amount).toLocaleString("es-MX")}`,
    flag: "🇲🇽",
    whatsappPrefix: "+52",
    shipping: "Envío gratis a todo México (5-10 días hábiles)",
    cities: ["CDMX", "Guadalajara", "Monterrey", "Puebla", "Cancún", "Tijuana"],
    paymentMethods: "OXXO, tarjeta de crédito/débito, transferencia SPEI, Mercado Pago",
    contraentrega: false,
    slang: ["neta", "chido", "padre", "órale"],
    expressions: ["¡Está bien chido!", "¡Neta que sí funciona!", "¡Órale, qué padre!"],
    names: ["Fernanda Ramírez", "Diego Sánchez", "Sofía Torres", "Alejandro Morales", "Daniela Cruz", "Roberto Flores", "Mariana Jiménez", "José Luis Vega"],
  },
  BR: {
    name: "Brasil",
    currency: "BRL",
    symbol: "R$",
    locale: "pt-BR",
    rate: 5.2, // 1 USD = ~5.2 BRL
    decimals: 2,
    format: (amount) => `R$${amount.toFixed(2).replace(".", ",")}`,
    flag: "🇧🇷",
    whatsappPrefix: "+55",
    shipping: "Frete grátis para todo o Brasil (5-12 dias úteis)",
    cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Belo Horizonte"],
    paymentMethods: "PIX, boleto bancário, cartão de crédito, Mercado Pago",
    contraentrega: false,
    slang: ["massa", "show", "top", "bom demais"],
    expressions: ["Que massa!", "Show de bola!", "Top demais!"],
    names: ["Ana Souza", "Lucas Oliveira", "Camila Santos", "Pedro Silva", "Juliana Costa", "Rafael Pereira", "Fernanda Lima", "Gustavo Almeida"],
  },
  CL: {
    name: "Chile",
    currency: "CLP",
    symbol: "$",
    locale: "es-CL",
    rate: 950, // 1 USD = ~950 CLP
    decimals: 0,
    format: (amount) => `$${Math.round(amount).toLocaleString("es-CL")}`,
    flag: "🇨🇱",
    whatsappPrefix: "+56",
    shipping: "Envío gratis a todo Chile (3-7 días hábiles)",
    cities: ["Santiago", "Valparaíso", "Concepción", "Viña del Mar", "Antofagasta"],
    paymentMethods: "Webpay, tarjeta de crédito/débito, transferencia bancaria",
    contraentrega: false,
    slang: ["bacán", "cacha", "po"],
    expressions: ["¡Está bacán, po!", "¡Cachai lo bueno que es!"],
    names: ["Catalina Muñoz", "Sebastián Vargas", "Francisca Rojas", "Matías González", "Javiera Soto", "Tomás Contreras"],
  },
  PE: {
    name: "Perú",
    currency: "PEN",
    symbol: "S/",
    locale: "es-PE",
    rate: 3.8, // 1 USD = ~3.8 PEN
    decimals: 2,
    format: (amount) => `S/${amount.toFixed(2)}`,
    flag: "🇵🇪",
    whatsappPrefix: "+51",
    shipping: "Envío gratis a todo Perú (5-10 días hábiles)",
    cities: ["Lima", "Arequipa", "Cusco", "Trujillo", "Chiclayo"],
    paymentMethods: "Yape, Plin, tarjeta de crédito, transferencia bancaria, contraentrega",
    contraentrega: true,
    slang: ["chévere", "causa", "bacán"],
    expressions: ["¡Está bacán, causa!", "¡Chévere!"],
    names: ["Milagros Quispe", "José Huamán", "Lucía Flores", "Carlos Mendoza", "Alejandra Torres", "Diego Castillo"],
  },
  AR: {
    name: "Argentina",
    currency: "ARS",
    symbol: "$",
    locale: "es-AR",
    rate: 900, // 1 USD = ~900 ARS
    decimals: 0,
    format: (amount) => `$${Math.round(amount).toLocaleString("es-AR")}`,
    flag: "🇦🇷",
    whatsappPrefix: "+54",
    shipping: "Envío gratis a toda Argentina (5-10 días hábiles)",
    cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "Mar del Plata"],
    paymentMethods: "Mercado Pago, transferencia bancaria, tarjeta de crédito",
    contraentrega: false,
    slang: ["copado", "genial", "re bueno", "piola"],
    expressions: ["¡Está re copado!", "¡Es genial, boludo!", "¡Re piola!"],
    names: ["Martina Fernández", "Nicolás Romero", "Valentina Álvarez", "Facundo Ruiz", "Camila Benítez", "Lautaro Acosta"],
  },
  EC: {
    name: "Ecuador",
    currency: "USD",
    symbol: "$",
    locale: "es-EC",
    rate: 1,
    decimals: 2,
    format: (amount) => `$${amount.toFixed(2)}`,
    flag: "🇪🇨",
    whatsappPrefix: "+593",
    shipping: "Envío gratis a todo Ecuador (5-10 días hábiles)",
    cities: ["Quito", "Guayaquil", "Cuenca", "Manta", "Ambato"],
    paymentMethods: "Transferencia bancaria, tarjeta de crédito, De Una",
    contraentrega: true,
  },
  PA: {
    name: "Panamá",
    currency: "USD",
    symbol: "$",
    locale: "es-PA",
    rate: 1,
    decimals: 2,
    format: (amount) => `$${amount.toFixed(2)}`,
    flag: "🇵🇦",
    whatsappPrefix: "+507",
    shipping: "Envío gratis a todo Panamá (3-7 días hábiles)",
    cities: ["Ciudad de Panamá", "Colón", "David", "Santiago", "Chitré"],
    paymentMethods: "Tarjeta de crédito/débito, Yappy, transferencia bancaria",
    contraentrega: false,
  },
  US: {
    name: "Estados Unidos",
    currency: "USD",
    symbol: "$",
    locale: "en-US",
    rate: 1,
    decimals: 2,
    format: (amount) => `$${amount.toFixed(2)}`,
    flag: "🇺🇸",
    whatsappPrefix: "+1",
    shipping: "Free shipping across the US (3-7 business days)",
    cities: ["Miami", "New York", "Los Angeles", "Houston", "Chicago"],
    paymentMethods: "Credit card, PayPal, Apple Pay, Google Pay",
    contraentrega: false,
  },
  CR: {
    name: "Costa Rica",
    currency: "CRC",
    symbol: "₡",
    locale: "es-CR",
    rate: 530, // 1 USD = ~530 CRC
    decimals: 0,
    format: (amount) => `₡${Math.round(amount).toLocaleString("es-CR")}`,
    flag: "🇨🇷",
    whatsappPrefix: "+506",
    shipping: "Envío gratis a toda Costa Rica (3-7 días hábiles)",
    cities: ["San José", "Alajuela", "Heredia", "Cartago", "Liberia", "Puntarenas"],
    paymentMethods: "SINPE Móvil, tarjeta de crédito/débito, transferencia bancaria, contraentrega",
    contraentrega: true,
    slang: ["mae", "pura vida", "tuanis", "diay"],
    expressions: ["¡Pura vida!", "¡Qué tuanis!", "¡Mae, esto está genial!"],
    names: ["María Fernanda Solano", "José Pablo Vargas", "Andrea Mora", "Diego Chaves", "Valeria Jiménez", "Kevin Brenes"],
  },
  GT: {
    name: "Guatemala",
    currency: "GTQ",
    symbol: "Q",
    locale: "es-GT",
    rate: 7.8, // 1 USD = ~7.8 GTQ
    decimals: 2,
    format: (amount) => `Q${amount.toFixed(2)}`,
    flag: "🇬🇹",
    whatsappPrefix: "+502",
    shipping: "Envío gratis a toda Guatemala (5-10 días hábiles)",
    cities: ["Ciudad de Guatemala", "Quetzaltenango", "Mixco", "Villa Nueva", "Escuintla"],
    paymentMethods: "Tarjeta de crédito/débito, transferencia bancaria, pago en efectivo",
    contraentrega: true,
    slang: ["vos", "cabal", "chilero"],
    expressions: ["¡Qué chilero!", "¡Está cabal!"],
    names: ["María José López", "Carlos Hernández", "Sofía Morales", "Luis Pérez", "Ana Lucía García", "José Miguel Castillo"],
  },
  HN: {
    name: "Honduras",
    currency: "HNL",
    symbol: "L",
    locale: "es-HN",
    rate: 24.8, // 1 USD = ~24.8 HNL
    decimals: 2,
    format: (amount) => `L${amount.toFixed(2)}`,
    flag: "🇭🇳",
    whatsappPrefix: "+504",
    shipping: "Envío gratis a toda Honduras (5-10 días hábiles)",
    cities: ["Tegucigalpa", "San Pedro Sula", "La Ceiba", "Choloma", "Comayagua"],
    paymentMethods: "Tigo Money, tarjeta de crédito/débito, transferencia bancaria, pago contra entrega",
    contraentrega: true,
    slang: ["vos", "catracho"],
    expressions: ["¡Qué calidá!"],
    names: ["Karla Mejía", "José Luis Reyes", "Daniela Flores", "Kevin Orellana", "Andrea Portillo", "Bryan López"],
  },
  SV: {
    name: "El Salvador",
    currency: "USD",
    symbol: "$",
    locale: "es-SV",
    rate: 1,
    decimals: 2,
    format: (amount) => `$${amount.toFixed(2)}`,
    flag: "🇸🇻",
    whatsappPrefix: "+503",
    shipping: "Envío gratis a todo El Salvador (3-7 días hábiles)",
    cities: ["San Salvador", "Santa Ana", "San Miguel", "Soyapango", "Santa Tecla"],
    paymentMethods: "Tarjeta de crédito/débito, transferencia bancaria, pago en efectivo, Bitcoin",
    contraentrega: true,
    slang: ["vos", "cipote", "chivo"],
    expressions: ["¡Está chivo!"],
    names: ["Gabriela Martínez", "Ricardo Mejía", "Katherine López", "Carlos Hernández", "Fátima Romero", "Óscar Ayala"],
  },
  NI: {
    name: "Nicaragua",
    currency: "NIO",
    symbol: "C$",
    locale: "es-NI",
    rate: 36.8, // 1 USD = ~36.8 NIO
    decimals: 2,
    format: (amount) => `C$${amount.toFixed(2)}`,
    flag: "🇳🇮",
    whatsappPrefix: "+505",
    shipping: "Envío gratis a toda Nicaragua (5-10 días hábiles)",
    cities: ["Managua", "León", "Masaya", "Granada", "Matagalpa"],
    paymentMethods: "Tarjeta de crédito/débito, transferencia bancaria, pago contra entrega",
    contraentrega: true,
    slang: ["vos", "ideay"],
    expressions: ["¡Ideay!"],
    names: ["María José Gómez", "Carlos Espinoza", "Scarleth López", "Kevin Martínez", "Yessenia García", "Denis Morales"],
  },
  DO: {
    name: "República Dominicana",
    currency: "DOP",
    symbol: "RD$",
    locale: "es-DO",
    rate: 58, // 1 USD = ~58 DOP
    decimals: 2,
    format: (amount) => `RD$${Math.round(amount).toLocaleString("es-DO")}`,
    flag: "🇩🇴",
    whatsappPrefix: "+1809",
    shipping: "Envío gratis a toda República Dominicana (3-7 días hábiles)",
    cities: ["Santo Domingo", "Santiago", "La Romana", "San Pedro de Macorís", "Puerto Plata"],
    paymentMethods: "Tarjeta de crédito/débito, transferencia bancaria, pago contra entrega",
    contraentrega: true,
    slang: ["klk", "dímelo", "manito"],
    expressions: ["¡Dímelo!", "¡Klk manito!"],
    names: ["Yulissa Pérez", "José Miguel Santos", "Altagracia Rodríguez", "Franklin Marte", "Rosanny García", "Dariel Hernández"],
  },
  PY: {
    name: "Paraguay",
    currency: "PYG",
    symbol: "₲",
    locale: "es-PY",
    rate: 7300, // 1 USD = ~7300 PYG
    decimals: 0,
    format: (amount) => `₲${Math.round(amount).toLocaleString("es-PY")}`,
    flag: "🇵🇾",
    whatsappPrefix: "+595",
    shipping: "Envío gratis a todo Paraguay (5-10 días hábiles)",
    cities: ["Asunción", "Ciudad del Este", "San Lorenzo", "Luque", "Encarnación"],
    paymentMethods: "Tarjeta de crédito/débito, transferencia bancaria, giros, pago contra entrega",
    contraentrega: true,
    slang: ["nde", "japu'a"],
    expressions: ["¡Está bárbaro!"],
    names: ["María Belén Ayala", "Carlos Benítez", "Liz Paola Giménez", "Diego Villalba", "Rocío Espínola", "Julio González"],
  },
  UY: {
    name: "Uruguay",
    currency: "UYU",
    symbol: "$U",
    locale: "es-UY",
    rate: 40, // 1 USD = ~40 UYU
    decimals: 0,
    format: (amount) => `$U${Math.round(amount).toLocaleString("es-UY")}`,
    flag: "🇺🇾",
    whatsappPrefix: "+598",
    shipping: "Envío gratis a todo Uruguay (3-7 días hábiles)",
    cities: ["Montevideo", "Salto", "Paysandú", "Maldonado", "Rivera"],
    paymentMethods: "Tarjeta de crédito/débito, Abitab, RedPagos, transferencia bancaria",
    contraentrega: false,
    slang: ["bo", "ta", "bárbaro"],
    expressions: ["¡Ta bárbaro!", "¡Bo, mirá esto!"],
    names: ["Valentina Rodríguez", "Martín Fernández", "Camila Suárez", "Santiago Núñez", "Lucía Correa", "Facundo Martínez"],
  },
  BO: {
    name: "Bolivia",
    currency: "BOB",
    symbol: "Bs",
    locale: "es-BO",
    rate: 6.9, // 1 USD = ~6.9 BOB
    decimals: 2,
    format: (amount) => `Bs${amount.toFixed(2)}`,
    flag: "🇧🇴",
    whatsappPrefix: "+591",
    shipping: "Envío gratis a toda Bolivia (5-10 días hábiles)",
    cities: ["La Paz", "Santa Cruz", "Cochabamba", "Sucre", "Oruro"],
    paymentMethods: "Tigo Money, tarjeta de crédito/débito, transferencia bancaria, pago contra entrega",
    contraentrega: true,
    slang: ["yunta", "jailón"],
    expressions: ["¡Está yunta!"],
    names: ["Carla Mamani", "Juan Carlos Quispe", "Paola Gutiérrez", "Luis Fernando Rojas", "Adriana Flores", "Marco Antonio Chávez"],
  },
  VE: {
    name: "Venezuela",
    currency: "USD",
    symbol: "$",
    locale: "es-VE",
    rate: 1,
    decimals: 2,
    format: (amount) => `$${amount.toFixed(2)}`,
    flag: "🇻🇪",
    whatsappPrefix: "+58",
    shipping: "Envío a toda Venezuela (7-15 días hábiles)",
    cities: ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay"],
    paymentMethods: "Pago Móvil, Zelle, Binance Pay, tarjeta de crédito, efectivo USD",
    contraentrega: false,
    slang: ["chamo", "verga", "chevere"],
    expressions: ["¡Qué chévere!", "¡Chamo, mira esto!"],
    names: ["Daniela Pérez", "José Alejandro Rivas", "Valentina Contreras", "Carlos Mendoza", "María Alejandra López", "Andrés Marcano"],
  },
  ES: {
    name: "España",
    currency: "EUR",
    symbol: "€",
    locale: "es-ES",
    rate: 0.92, // 1 USD = ~0.92 EUR
    decimals: 2,
    format: (amount) => `${amount.toFixed(2).replace(".", ",")}€`,
    flag: "🇪🇸",
    whatsappPrefix: "+34",
    shipping: "Envío gratis a toda España (3-7 días hábiles)",
    cities: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Málaga"],
    paymentMethods: "Tarjeta de crédito/débito, Bizum, PayPal, transferencia bancaria",
    contraentrega: false,
  },
};

// ─── CONVERTIR USD A MONEDA LOCAL ───────────────────────────
export function convertPrice(priceUsd, countryCode) {
  const country = COUNTRIES[countryCode] || COUNTRIES.US;
  const localPrice = parseFloat(priceUsd) * country.rate;

  // Redondear a precio psicológico
  if (country.decimals === 0) {
    return roundToPsychological(localPrice, country.currency);
  }
  return Math.round(localPrice * 100) / 100;
}

// ─── FORMATEAR PRECIO ───────────────────────────────────────
export function formatPrice(priceUsd, countryCode) {
  const country = COUNTRIES[countryCode] || COUNTRIES.US;
  const localPrice = convertPrice(priceUsd, countryCode);
  return country.format(localPrice);
}

// ─── REDONDEO PSICOLÓGICO ───────────────────────────────────
// $125.847 COP → $125.900 (termina en 900)
// $598 MXN → $599 (termina en 9)
function roundToPsychological(price, currency) {
  if (currency === "COP") {
    // Redondear a la centena más cercana terminando en 900
    const rounded = Math.ceil(price / 1000) * 1000 - 100;
    return rounded > 0 ? rounded : Math.round(price / 100) * 100;
  }
  if (currency === "CLP") {
    // Redondear a la decena terminando en 90
    const rounded = Math.ceil(price / 100) * 100 - 10;
    return rounded > 0 ? rounded : Math.round(price / 10) * 10;
  }
  if (currency === "ARS") {
    const rounded = Math.ceil(price / 1000) * 1000 - 1;
    return rounded > 0 ? rounded : Math.round(price);
  }
  // MXN y otros
  const rounded = Math.ceil(price / 10) * 10 - 1;
  return rounded > 0 ? rounded : Math.round(price);
}

// ─── OBTENER DATOS DEL PAÍS ─────────────────────────────────
export function getCountryData(countryCode) {
  return COUNTRIES[countryCode] || COUNTRIES.CO;
}

// ─── OBTENER LISTA DE PAÍSES PARA SELECT ────────────────────
export function getCountryOptions() {
  return Object.entries(COUNTRIES).map(([code, data]) => ({
    code,
    label: `${data.flag} ${data.name} (${data.currency})`,
    name: data.name,
    currency: data.currency,
    flag: data.flag,
  }));
}

// ─── GENERAR TEXTO DE PRECIOS PARA LANDING ──────────────────
export function getPriceDisplay(priceUsd, comparePriceUsd, countryCode) {
  const country = COUNTRIES[countryCode] || COUNTRIES.CO;
  const price = convertPrice(priceUsd, countryCode);
  const formattedPrice = country.format(price);

  let formattedCompare = null;
  let savings = null;

  if (comparePriceUsd) {
    const compareLocal = convertPrice(comparePriceUsd, countryCode);
    formattedCompare = country.format(compareLocal);
    const savingsAmount = compareLocal - price;
    savings = country.format(savingsAmount);
  }

  return {
    price: formattedPrice,
    comparePrice: formattedCompare,
    savings,
    currency: country.currency,
    symbol: country.symbol,
    localPrice: price,
  };
}
