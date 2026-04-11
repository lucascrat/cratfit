import fs from 'fs';

const mapping = {
    "Ombros/Desenvolvimento de ombro na máquina.gif": "exercises/1768273097703_Desenvolvimento-de-ombro-na-maquina.gif",
    "Ombros/elevação letaral com haltrers.gif": "exercises/1768273189810_elevacao-letaral-com-haltrers.gif",
    "Ombros/Elevação lateral na máquina.gif": "exercises/1768273182145_Elevacao-lateral-na-maquina.gif",
    "Ombros/elevação frontal com halteres.gif": "exercises/1768273155110_elevacao-frontal-com-halteres.gif",
    "Ombros/Elevação Frontal com Barra.gif": "exercises/1768273146563_Elevacao-Frontal-com-Barra.gif",
    "Ombros/elevação unilateral no cross.gif": "exercises/1768273196367_elevacao-unilateral-no-cross.gif",
    "Tríceps/Tríceps Francês com Halteres.gif": "exercises/1768273813636_Tríceps-Frances-com-Halteres.gif",
    "Tríceps/Extensão de tríceps na máquina.gif": "exercises/1768273737400_Extensao-de-tríceps-na-máquina.gif",
    "Pernas/Máquina de Adução de Quadril.gif": "exercises/1768273599214_Maquina-de-Adução-de-Quadril.gif",
    "Glúteos/Elevação Pélvica Com Barra.gif": "exercises/1768272935001_Elevacao-Pelvica-Com-Barra.gif",
    "Glúteos/Elevação Pélvica Na Máquina.gif": "exercises/1768272937950_Elevacao-Pelvica-Na-Maquina.gif",
    "Glúteos/Glúteo Coice Na Máquina.gif": "exercises/1768272955410_Gluteo-Coice-Na-Máquina.gif",
    "Glúteos/Glúteos na Polia Baixa.gif": "exercises/1768272960642_Gluteos-na-Polia-Baixa.gif",
    "Glúteos/Máquina de Abdução de Quadril.gif": "exercises/1768272962166_Maquina-de-Abducao-de-Quadril.gif",
    "Glúteos/Extensão de Quadril com Cabo.gif": "exercises/1768272947734_Extensao-de-Quadril-com-Cabo.gif",
    "Abdominal/Abdominal Crunch na Polia Alta (em pé). Executado no cross over puxando a corda para baixo, focando na contração do abdômen.gif": "exercises/1768272240456_Abdominal-Crunch-na-Polia-Alta-em-pe-Executado-no-cross-over.gif",
    "Abdominal/Abdominal Infra no Solo-Elevação de Pernas.gif": "exercises/1768272248899_Abdominal-Infra-no-Solo-Elevacao-de-Pernas.gif",
    "Abdominal/Abdominal Oblíquo Cruzado (unilateral).gif": "exercises/1768272253346_Abdominal-Obliquo-Cruzado-(unilateral).gif",
    "Cardio/Esteira Ergométrica.gif": "exercises/1768272726965_Esteira-Ergometrica.gif",
    "Cardio/Esteira com Inclinação.gif": "exercises/1768272724594_Esteira-com-Inclinacao.gif",
    "Cardio/Máquina Elíptica.gif": "exercises/1768272734532_Máquina-Eliptica.gif",
    "Cardio/Máquina Simulador Escada.gif": "exercises/1768272733144_Maquina-Simulador-Escada.gif"
};

const filePath = '../app/src/data/exerciseData.js';
let content = fs.readFileSync(filePath, 'utf8');

let count = 0;
for (const [legacy, correct] of Object.entries(mapping)) {
    if (content.includes(`gif: '${legacy}'`)) {
        content = content.replace(`gif: '${legacy}'`, `gif: '${correct}'`);
        count++;
    }
}

fs.writeFileSync(filePath, content);
console.log(`Updated ${count} GIF paths in exerciseData.js`);
