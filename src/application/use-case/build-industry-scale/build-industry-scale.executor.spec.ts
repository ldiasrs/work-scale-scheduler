
import { Professional } from "../../domain/professional"
import { Speciality } from "../../domain/speciality"
import { SpecialityDemand } from "../../domain/speciality-demand"
import { TagDemand } from "../../domain/tag-demand"
import { WorkPlace } from "../../domain/work-place"
import { WorkPlaceDemand } from "../../domain/work-place-demand"
import { BuildIndustryScaleExecutor } from "./build-industry-scale.executor"


//Montar uma lista de profissionais que atendam a demanda de cada hospital
//Os profissionais devem ser alocados de acordo com a tag
//Se não houver profissionais suficientes para atender a demanda, o sistema deve retornar uma mensagem de erro
//O mesmo profissional não pode ser alocado em mais de um hospital
//O sistema deve retornar uma lista de profissionais alocados em cada hospital


describe('BuildIndustryScaleExecutor', () => {

    type Options ={
        professionalsData? : any[],
        industryDemandsData?: any[],
    }
    const makeParams=(options: Options) =>{
        const professionalsData = options.professionalsData ?? [
            {name: 'Medico 1',especialities: ['Clinico Geral'], tags: ['cirurgiao']},
            {name: 'Medico 2',especialities: ['Clinico Geral'], tags: ['pediatra']},
            {name: 'Medico 3',especialities: ['Anestesista'], tags: ['pediatra']},
            {name: 'Medico 4',especialities: ['Anestesista'], tags: []},
            {name: 'Enfermeiro 1',especialities: ['Enfermeiro'], tags: ['bombeiro']},
            {name: 'Enfermeiro 2',especialities: ['Enfermeiro'], tags: []},
            {name: 'Enfermeiro 3',especialities: ['Enfermeiro'], tags: []},
            {name: 'Enfermeiro 4',especialities: ['Enfermeiro'], tags: []},
        ]
        const industryDemandsData = options.industryDemandsData ?? [
            {place: 'Hospital A', specialities: [{'Clinico Geral': 1}, {'Enfermeiro':1}], tags: ['bombeiro']},
            {place: 'Hospital B', specialities: [{'Clinico Geral': 1}, {'Enfermeiro':1}], tags: ['cirurgiao']},
        ]
        return {
            workPlaceDemands: mapIndustryDemands(industryDemandsData), 
            professionals: mapProfessionals(professionalsData)
        }
    }
    it('should allocate professionals of a industry work places demands', () => {
        const {workPlaceDemands, professionals} = makeParams({});
        const industryScale = new BuildIndustryScaleExecutor().execute({workPlaceDemands, professionals})
        expect(industryScale.workPlaceScales[0].professionalScales.length).toBe(3)
    })

    const mapIndustryDemands = (industryDemandsData)=>  {
        return industryDemandsData.map(industryDemandData => {
            return new WorkPlaceDemand({
                workPlace: new WorkPlace({name: industryDemandData.place}),
                specialityDemands: industryDemandData.specialities.map(specialityData => {
                    const specialityName = Object.keys(specialityData)[0];
                    const quantity = specialityData[specialityName];
                    return new SpecialityDemand({
                        speciality: new Speciality({name: specialityName}),
                        quantity
                    })
                }),
                tagDemands: industryDemandData.tags.map(tag => new TagDemand({tag, quantity: 1}))
            })
        });
    }

    const mapProfessionals = (professionalsData) => {
        return  professionalsData.map(professionalData => {
            return new Professional({
                name: professionalData.name,
                especilities: professionalData.especialities.map(name => new Speciality({name})),
                tags: professionalData.tags
            })
        })
    }
})