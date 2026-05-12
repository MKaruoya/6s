/**
 * EXACT CHECKPOINT DATA FROM CAPWELL AUDIT FORMS
 * All 4 forms with exact checkpoint names, descriptions, and scoring
 */

export const auditCheckpoints = {
  warehouse: {
    id: 'warehouse',
    name: 'Warehouse 6S Audit',
    code: 'CIL/OPEX/6S/REC/004',
    revision: '002/2025',
    maxScore: 100,
    scope: 'Raw Material, Finished Goods, Stationery Stores, Engineering Stores',
    scoringCriteria: '0 abnormality = Full marks; 1-2 Abnormalities = Half marks; ≥3 Abnormalities = 0',
    sections: [
      {
        code: '1S',
        name: 'KUCHAGUA',
        english: 'Sort',
        maxPoints: 10,
        checkpoints: [
          {
            id: 1,
            question: 'Are there unwanted items or materials in the store?',
            description: 'Check for expired/rejected/obsolete items within the store'
          },
          {
            id: 2,
            question: 'Are there excess items or materials in the store?',
            description: 'Refer to maximum stock levels'
          },
          {
            id: 3,
            question: 'Are all of the equipment needed?',
            description: 'Look for faulty/unnecessary equipment at the gemba. Any faulty or defective equipment should be tagged'
          },
          {
            id: 4,
            question: 'Are all display boards (6K/O, Notice, AM, Performance, etc) up to date with the relevant and current postings?',
            description: 'Check for outdated, un-updated and irrelevant materials on the boards'
          },
          {
            id: 5,
            question: 'Are the red tag items clearly separated, identified and tagged?',
            description: 'A red tag area should be in place and items tagged. Check for expired red tags (above 6 weeks) and a red tag SOP'
          }
        ]
      },
      {
        code: '2S',
        name: 'KUPANGA',
        english: 'Set in Order',
        maxPoints: 15,
        checkpoints: [
          {
            id: 1,
            question: 'Are all material placed in designated areas and arranged as per "runners", "repeaters" and "strangers"?',
            description: 'Check if there is a clear issuing/receiving system that is documented in a process flow chart or SOP'
          },
          {
            id: 2,
            question: 'Are all gangways marked and clear of obstruction?',
            description: 'Check for material in the gangways, check for well demarcated gangways. Stacks should not be too high. Check if tools have a clear designated location'
          },
          {
            id: 3,
            question: 'Is storage of material and tools easy, safe and ready for use?',
            description: 'Stacks should not be too high. Check if tools have a clear designated location'
          },
          {
            id: 4,
            question: 'Is there a well designated Receiving area/Loading bay?',
            description: 'Check for evidence of bin cards or for any type of pull signal (Replenishment Module, E-Kanban, Physical Kanban, etc)'
          },
          {
            id: 5,
            question: 'Is there evidence of stock control?',
            description: 'Are there signs showing the names of materials as per the floor plan/address system. Check if maximum stock values are indicated in the signboards'
          }
        ]
      },
      {
        code: '3S',
        name: 'KUSAFISHA',
        english: 'Shine/Clean',
        maxPoints: 15,
        checkpoints: [
          {
            id: 1,
            question: 'Are the floors/stairs/displays clean?',
            description: 'Check that displays, floors are free from dust, oil, leakages, spillages, water and litter'
          },
          {
            id: 2,
            question: 'Are the racks, stacks and shelves clean on the inside, outside and underneath?',
            description: 'Equipment should be free from excessive dust and contamination'
          },
          {
            id: 3,
            question: 'Is there a clearly marked "Cleaning Station" with adequate tools as per cleaning schedule?',
            description: 'Check "Cleaning station" for non-standard cleaners, missing tools, wrong locations and adequacy of cleaning tools as per cleaning schedule'
          },
          {
            id: 4,
            question: 'Are all rubbish & reject materials in appropriate containers?',
            description: 'Look for well labelled dust bins'
          },
          {
            id: 5,
            question: 'Is the area surrounding the gemba (e.g. compound, verander) free of unwanted items and clean?',
            description: 'Check for uncollected rubbish/scrap, cleanliness of the compound and accumulated dirt on external windows'
          }
        ]
      },
      {
        code: '4S',
        name: 'KUSANIFISHA',
        english: 'Standardize',
        maxPoints: 20,
        checkpoints: [
          {
            id: 1,
            question: 'Are standards for stacking respected?',
            description: 'Ensure stacks are neatly stacked for easy counting and identification'
          },
          {
            id: 2,
            question: 'Are the established safety and cleaning checklists practiced and are cleaning/safety standards maintained? Are there any omitted areas in checklists?',
            description: 'Compare the actual checks made versus status of the gemba'
          },
          {
            id: 3,
            question: 'Are all the displays at the gemba as per the standard?',
            description: 'Check whether all the displays are standard; Notice board, 5S+S board, DK board, Safety checklist, Kanban board, Look for list, Before & After photos, OPLs, SOPs, Action plans'
          },
          {
            id: 4,
            question: 'Are gangways and fire exit route free from obstruction and marked as per the standard?',
            description: 'Check for standard fire exit signs, obstruction on the gangway and standard marking'
          },
          {
            id: 5,
            question: 'Are the standards for the red/green/yellow tagged materials and their disposal/repairs practiced?',
            description: 'Check if the red/green/yellow tag retention periods are adhered to. Overdue tags must be approved in writing by the Plant Head indicating timelines'
          }
        ]
      },
      {
        code: '5S',
        name: 'KUDUMISHA',
        english: 'Sustain',
        maxPoints: 20,
        checkpoints: [
          {
            id: 1,
            question: 'Are monthly meetings and weekly 6S activities conducted?',
            description: 'Check for evidence in weekly attendance register for 6S activities and minutes of at least one formal meeting per month. Also check if each member has a role in the team file and action plan'
          },
          {
            id: 2,
            question: 'Are trainings conducted within the Gemba effective?',
            description: 'Test gemba owners on the awareness of red/green/yellow tags and their retention periods and other topics trained on during trainings. There should be evidence of at least one training per month'
          },
          {
            id: 3,
            question: 'Are there routine Gemba audits done at least once every month?',
            description: 'Check the previous two months\' audit scores. If the team declined last month, penalize as follows; Declined by 0-5 marks (No penalty) 5.1-10 marks (award half the marks) and no marks awarded for a decline above 10 points'
          },
          {
            id: 4,
            question: 'Has the team set at least 5 SMART action plans and do they make progress in closing the actions within set timelines?',
            description: 'Check the number of actions planned and see if issues raised in previous audit have been actioned and at least 80% of last month\'s actions were closed on time'
          },
          {
            id: 5,
            question: 'Has the team made any remarkable gemba improvement?',
            description: 'Check for any unique changes at the gemba that make work easier or safer (New process, practice and service or modifications. Team should demonstrate how and should have a record of the same in the team file. (Half marks for one innovation and full marks for more than one innovation)'
          }
        ]
      },
      {
        code: '6S',
        name: 'KUSITIRISHA',
        english: 'Safety',
        maxPoints: 20,
        scoringOptions: [0, 4],
        checkpoints: [
          {
            id: 1,
            question: 'Are employees actively reporting hazards, near-misses, and unsafe acts? Test the members of the awareness of LOTOTO (Lock out, Tag out, Try out)',
            description: 'Check for hazards in the gemba. Check for obstructed gang ways, naked wires, wet or slippery floors, chemicals improperly stored. Check for hazards reported and indicated in the action plan and evidence of closure of identified hazards. Test the people working on machinery on use of LOTOTO as a safety measure. Award marks as follows; two or more closed hazards (award full marks), one closed hazard (half the marks), and no marks awarded for no hazard closed'
          },
          {
            id: 2,
            question: 'Is the required PPE available, in good condition, and being worn correctly?',
            description: 'Check for PPE usage against identified hazards. Ear muffs and/or plugs in noise areas, gloves, masks, safety shoes. PPEs should be appropriate and clean'
          },
          {
            id: 3,
            question: 'Is the team actively participating in toolbox talks and awareness sessions. Is there a fire extinguisher and do members understand the operating procedure?',
            description: 'Check for attendance register for monthly toolbox talk, check for practice of what has been discussed in previous toolbox talks. Test gemba owners on awareness of PASS in fire fighting'
          },
          {
            id: 4,
            question: 'Are first aid boxes available, accessible and well stocked? Team should provide record for lost time injury frequency rate',
            description: 'Check for expired first aid items in first aid boxes check for first aid check list should be valid for 3 months. For lost time, penalize as follows; 0-15 min (no penalty), 16-30 min (award half the marks), and no marks awarded for more than 30 min lost'
          },
          {
            id: 5,
            question: 'Is the team aware of the fire safety and emergency preparedness procedures?',
            description: 'Check for obstructed fire equipment, interview staff on awareness of the fire fighting procedures and whether they know where fire assembly point is. Check for unobstructed fire exits'
          }
        ]
      }
    ]
  },

  shopfloor: {
    id: 'shopfloor',
    name: 'Plant/Shopfloor 6S Audit',
    code: 'CIL/OPEX/6S/REC/002',
    revision: '003/2025',
    maxScore: 120,
    scope: 'Production processes and Maintenance Workshop',
    scoringCriteria: '0 abnormality = Full marks; 1-2 Abnormalities = Half marks; ≥3 Abnormalities = 0',
    sections: [
      {
        code: '1S',
        name: 'KUCHAGUA',
        english: 'Sort',
        maxPoints: 20,
        checkpoints: [
          {
            id: 1,
            question: 'Are there unwanted items or materials in the shopfloor?',
            description: 'Check for expired/rejected/obsolete items within the gemba'
          },
          {
            id: 2,
            question: 'Are there excess items or materials in the shopfloor?',
            description: 'Refer to maximum stock levels'
          },
          {
            id: 3,
            question: 'Are all of the equipment needed?',
            description: 'Look for faulty/unnecessary equipment at the gemba. Any faulty or defective equipment should be tagged'
          },
          {
            id: 4,
            question: 'Are all display boards (6S/K, Notice, AM, Performance, etc) up to date with the relevant and current postings?',
            description: 'Check for outdated, un-updated and irrelevant materials on the boards'
          },
          {
            id: 5,
            question: 'Are the red tag items clearly separated, identified and tagged?',
            description: 'A red tag area should be in place and items tagged. Check for expired red tags (above 6 weeks) and a red tag SOP'
          }
        ]
      },
      {
        code: '2S',
        name: 'KUPANGA',
        english: 'Set in Order',
        maxPoints: 20,
        checkpoints: [
          {
            id: 1,
            question: 'Are tools and equipment stored in designated area & machines as per area zone map?',
            description: 'Check the area Zone map and tools on the tool board. Machine locations should be as per the map. Movable equipment not currently in use should be stored at their flexible parking zones'
          },
          {
            id: 2,
            question: 'Are the work area and its processes identified? Are signs in place showing name of machines, Product being made, Material flow?',
            description: 'Each machine should be identified. Product running should be identified as per packing lines and stock destinations arrows drawn on spouts'
          },
          {
            id: 3,
            question: 'Are all location for materials clearly marked and respected?',
            description: 'All material stored at shop floor should have a label to show identified storage location'
          },
          {
            id: 4,
            question: 'Are materials for each operation stored at the Point Of Use?',
            description: 'Materials should be stored as near as possible to the point of use - POUS'
          },
          {
            id: 5,
            question: 'Is all documentation in the right place on notice boards, shelves and workstations?',
            description: 'Documents in the notice boards, shelves and workstation should be orderly and at designated area'
          }
        ]
      },
      {
        code: '3S',
        name: 'KUSAFISHA',
        english: 'Shine/Clean',
        maxPoints: 20,
        checkpoints: [
          {
            id: 1,
            question: 'Are the floors, stairs, walls & displays clean?',
            description: 'Check that displays, floors are free from dust, oil, leakages, excessive spillages, water and litter'
          },
          {
            id: 2,
            question: 'Are the machines, electrical panels, spout & covers clean on the inside, outside and underneath?',
            description: 'Equipment should be free from excessive dust and contamination'
          },
          {
            id: 3,
            question: 'Is there a clearly marked "Cleaning/Kusafisha Station" with adequate tools as per cleaning schedule?',
            description: 'Check "Cleaning/Kusafisha station" for non-standard cleaners, missing tools, wrong locations and adequacy of cleaning tools as per cleaning schedule'
          },
          {
            id: 4,
            question: 'Are all rubbish & reject materials in appropriate containers?',
            description: 'Look for waste segregation in well labelled dust bins/containers'
          },
          {
            id: 5,
            question: 'Is the area surrounding the gemba (e.g. compound, verander) free of unwanted items and clean?',
            description: 'Check for uncollected rubbish, cleanliness of the compound and accumulated dirt on external windows'
          }
        ]
      },
      {
        code: '4S',
        name: 'KUSANIFISHA',
        english: 'Standardize',
        maxPoints: 20,
        checkpoints: [
          {
            id: 1,
            question: 'Are the established safety and cleaning checklists practiced and are cleaning/safety standards maintained? Are there any omitted areas in checklists?',
            description: 'Compare the actual checks made versus status of the gemba'
          },
          {
            id: 2,
            question: 'Are all the displays at the gemba as per the standard?',
            description: 'Check whether all the displays are standard; Notice board, 6S/K board, Safety checklist, Kanban board, Look for list, Before & After photos, OPLs, SOPs, Action plans'
          },
          {
            id: 3,
            question: 'Are gangways and fire exit route free from obstruction and marked as per the standard?',
            description: 'Check for obstruction on the gangways and standard marking'
          },
          {
            id: 4,
            question: 'Do the work stations display OPLs and SOPs sheets?',
            description: 'Check whether the SOPs and OPLs are displayed near the machine or processes for which they are developed. New SOPS/OPL\'s at least every 3 months'
          },
          {
            id: 5,
            question: 'Are the standards for the red/green/yellow tagged materials and their disposal/repairs practiced?',
            description: 'Check if the red/green/yellow tag retention periods are adhered to. Overdue tags must be approved in writing by the Site Manager indicating timelines'
          }
        ]
      },
      {
        code: '5S',
        name: 'KUDUMISHA',
        english: 'Sustain',
        maxPoints: 20,
        checkpoints: [
          {
            id: 1,
            question: 'Are monthly meetings and weekly 6S/6K activities conducted?',
            description: 'Check for evidence in weekly attendance register for 6S/6K activities and minutes of at least one formal meeting per month. Also check if each member has a role in the team file and action plan'
          },
          {
            id: 2,
            question: 'Are trainings conducted within the Gemba effective?',
            description: 'Test gemba owners on the awareness of red/green/yellow tags and their retention periods and other topics trained on during trainings. There should be evidence of at least one training per month'
          },
          {
            id: 3,
            question: 'Are there routine Gemba audits done at least once every month?',
            description: 'Check the previous two months\' audit scores. If the team declined last month, penalize as follows; Declined by 0-5 marks (No penalty) 5.1-10 marks (award half the marks) and no marks awarded for a decline above 10 points'
          },
          {
            id: 4,
            question: 'Has the team set at least 5 SMART action plans and do they make progress in closing the actions within set timelines?',
            description: 'Check the number of actions planned and see if issues raised in previous audit have been actioned and at least 80% of last month\'s actions were closed on time'
          },
          {
            id: 5,
            question: 'Has the team made any remarkable gemba improvement?',
            description: 'Check for any unique changes at the gemba that make work easier or safer (New process, practice and service or modifications). Team should demonstrate how and should have a record of the same in the team file. (Half marks for one innovation and full marks for more than one innovation)'
          }
        ]
      },
      {
        code: '6S',
        name: 'KUSITIRISHA',
        english: 'Safety',
        maxPoints: 20,
        checkpoints: [
          {
            id: 1,
            question: 'Are employees actively reporting hazards, near-misses, and unsafe acts? Test the members of the awareness of LOTOTO (Lock out, Tag out, Try out)',
            description: 'Check for hazards in the gemba. Check for obstructed gang ways, naked wires, wet or slippery floors, chemicals improperly stored. Check for hazards reported and indicated in the action plan and evidence of closure of identified hazards. Test the people working on machinery on use of LOTOTO as a safety measure. Award marks as follows; two or more closed hazards (award full marks), one closed hazard (half the marks), and no marks awarded for no hazard closed'
          },
          {
            id: 2,
            question: 'Is the required PPE available, in good condition, and being worn correctly?',
            description: 'Check for PPE usage against identified hazards. Ear muffs and/or plugs in noise areas, gloves, masks, safety shoes. PPEs should be appropriate and clean'
          },
          {
            id: 3,
            question: 'Is the team actively participating in toolbox talks and awareness sessions. Is there a fire extinguisher and do members understand the operating procedure?',
            description: 'Check for attendance register for monthly toolbox talk, check for practice of what has been discussed in previous toolbox talks. Test gemba owners on awareness of PASS in fire fighting'
          },
          {
            id: 4,
            question: 'Are first aid boxes available, accessible and well stocked? Team should provide record for lost time injury frequency rate',
            description: 'Check for expired first aid items in first aid boxes check for first aid check list should be valid for 3 months. For lost time, penalize as follows; 0-15 min (no penalty), 16-30 min (award half the marks), and no marks awarded for more than 30 min lost'
          },
          {
            id: 5,
            question: 'Is the team aware of the fire safety and emergency preparedness procedures?',
            description: 'Check for obstructed fire equipment, interview staff on awareness of the fire fighting procedures and whether they know where fire assembly point is. Check for unobstructed fire exits'
          }
        ]
      }
    ]
  },

  laboratory: {
    id: 'laboratory',
    name: 'Laboratory 6S Audit',
    code: 'CIL/OPEX/6S/REC/003',
    revision: '002/2025',
    maxScore: 100,
    scope: 'Laboratories',
    scoringCriteria: '0 Abnormality = Full Marks; 1-2 Abnormalities = Half of the Marks; ≥3 Abnormalities = Zero Marks',
    sections: [
      {
        code: '1S',
        name: 'KUCHAGUA',
        english: 'Sort',
        maxPoints: 10,
        scoringOptions: [0, 1, 2],
        checkpoints: [
          {
            id: 1,
            question: 'Are all of the chemicals & solvents needed and is there established requirement for chemicals & solvents. Also have they expired?',
            description: 'Check for excess & obsolete chemicals & solvent against established requirement. Also look for expired ones within the store'
          },
          {
            id: 2,
            question: 'Are all of the products & raw materials samples needed and is there a retention area for each sample category and disposal/analysis procedure exist?',
            description: 'Check for excess & obsolete samples. Also check the rework/reject/retention area & procedures'
          },
          {
            id: 3,
            question: 'Are all of the testing tools & equipments, machines, shelves, benches & stands needed and in good condition?',
            description: 'Look for unserviced machine & equipment as per the schedule. Also check faulty/unnecessary/excess testing tools & equipment, machine, shelves & benches at the gemba'
          },
          {
            id: 4,
            question: 'Are all display boards; 6S/K, Notice board up to date with the relevant and current postings?',
            description: 'Check for outdated, un-updated and irrelevant materials on the boards'
          },
          {
            id: 5,
            question: 'Are the red tag items clearly separated, identified and tagged?',
            description: 'A red tag area should be in place and with all items tagged'
          }
        ]
      },
      {
        code: '2S',
        name: 'KUPANGA',
        english: 'Set in Order',
        maxPoints: 15,
        scoringOptions: [0, 2, 3],
        checkpoints: [
          {
            id: 1,
            question: 'Are the work area and its processes identified? Are signs in place showing name of machines, equipments & test process?',
            description: 'Each machine should be identified. Tests carried out should be identified as per work stations'
          },
          {
            id: 2,
            question: 'Are all location for test equipments, samples & chemicals clearly identified and respected? Check max/min stock values – safely stacked?',
            description: 'All equipment, samples & chemicals stored at shop floor should have a storage place & everything in place including labels to show identified storage location'
          },
          {
            id: 3,
            question: 'Are materials for each operation stored near the Point Of Use?',
            description: 'Materials should be stored as near as possible to the point of use - POUS'
          },
          {
            id: 4,
            question: 'Are tools and equipment stored in designated area & machines as per area zone map?',
            description: 'Check the area Zone map and tools on the tool board. Machine & equipment locations should be as per the map'
          },
          {
            id: 5,
            question: 'Is all documentation in the right place on notice boards, shelves and workstations?',
            description: 'Documents in the notice boards, shelves and workstation should be orderly and at designated area'
          }
        ]
      },
      {
        code: '3S',
        name: 'KUSAFISHA',
        english: 'Shine/Clean',
        maxPoints: 15,
        scoringOptions: [0, 1.5, 3],
        checkpoints: [
          {
            id: 1,
            question: 'Are the floors, walls & displays clean?',
            description: 'Check that displays, floors & walls are free from dust, oil, leakages, spillages, water and litter'
          },
          {
            id: 2,
            question: 'Are the laboratory machines & equipments clean on the inside, outside and underneath? Are the working benches clean?',
            description: 'Equipment should be free from dirt, chemical spillages, oil spillages and contamination'
          },
          {
            id: 3,
            question: 'Is there a clearly marked "Kusafisha/cleaning Station" with adequate tools as per cleaning schedule?',
            description: 'Check "Kusafisha/cleaning station" for non-standard cleaners, missing tools, wrong locations and adequacy of cleaning tools as per cleaning schedule'
          },
          {
            id: 4,
            question: 'Are all rubbish & reject materials in appropriate containers?',
            description: 'Look for waste segregation in well labelled dust bins. Organic and non-organic waste should not be mixed'
          },
          {
            id: 5,
            question: 'Is the area surrounding the gemba; windows, window frames, stairs & veranders free of unwanted items and clean?',
            description: 'Check for uncollected rubbish, cleanliness of the stairs, veranders and external windows'
          }
        ]
      },
      {
        code: '4S',
        name: 'KUSANIFISHA',
        english: 'Standardize',
        maxPoints: 20,
        checkpoints: [
          {
            id: 1,
            question: 'Are the established safety and cleaning checklists practiced and are cleaning/safety standards maintained? Are there any omitted areas in checklists?',
            description: 'Compare the actual checks made versus status of the gemba'
          },
          {
            id: 2,
            question: 'Are all the displays at the gemba as per the standard?',
            description: 'Check whether all the displays are standard; Notice board, 6S/K board, Safety checklist, Kanban board, Look for list, Before & After photos, OPLs, SOPs, Action plans'
          },
          {
            id: 3,
            question: 'Are gangways and fire exit route free from obstruction and marked as per the standard?',
            description: 'Check for standard fire exit signs, obstruction on the gangways and standard marking'
          },
          {
            id: 4,
            question: 'Do the work stations display OPLs and SOPs sheets?',
            description: 'Check whether the SOPs and OPLs are displayed next to machine or processes which they are developed for. OPLs must exist to train staff. New SOPS/OPL\'s at least every 3 months'
          },
          {
            id: 5,
            question: 'Are the standards for the red/green/yellow tagged materials and their disposal/repairs understood?',
            description: 'Make inquiries to gemba owners about red, green and yellow tag standards. Check if items and hazards in Gemba are tagged'
          }
        ]
      },
      {
        code: '5S',
        name: 'KUDUMISHA',
        english: 'Sustain',
        maxPoints: 20,
        checkpoints: [
          {
            id: 1,
            question: 'Are routine meetings and weekly 6S/K activities conducted?',
            description: 'Check for evidence in weekly attendance register for 6S/K activities and minutes of at least one formal meeting per month. Also check if each member has a role in the team file and action plan'
          },
          {
            id: 2,
            question: 'Are trainings conducted within the Gemba effective?',
            description: 'Test gemba owners on the awareness on these trainings - use OPLs, SOPs and topics trained on during trainings'
          },
          {
            id: 3,
            question: 'Are there routine Gemba audits done at least once every month?',
            description: 'Audit sheets should exist and a trend chart plotted. In case of decline in last month\'s audit score, penalize as follows; Declined by 0-5 marks (No penalty) 5.1-10 marks (award half the marks) and no marks awarded for a decline above 10 points'
          },
          {
            id: 4,
            question: 'Has the team set at least 5 SMART action plans and do they make progress in closing the actions within set timelines?',
            description: 'Check the number of actions planned and see if issues raised in previous audit have been actioned and at least 80% of last month\'s actions were closed on time'
          },
          {
            id: 5,
            question: 'Has the team made any new innovation?',
            description: 'Check for any unique changes at the gemba (New process, product, practice, business model and service). Team should demonstrate how. (Half marks for one innovation and full marks for more than one innovation)'
          }
        ]
      },
      {
        code: '6S',
        name: 'KUSITIRISHA',
        english: 'Safety',
        maxPoints: 20,
        checkpoints: [
          {
            id: 1,
            question: 'Are employees actively reporting hazards, near-misses, and unsafe acts? Test the members of the awareness of LOTOTO (Lock out, Tag out, Try out)',
            description: 'Check for hazards in the gemba. Check for obstructed gang ways, naked wires, wet or slippery floors, chemicals improperly stored. Check for hazards reported and indicated in the action plan and evidence of closure of identified hazards. Test the people working on machinery on use of LOTOTO as a safety measure. Award marks as follows; two or more closed hazards (award full marks), one closed hazard (half the marks), and no marks awarded for no hazard closed'
          },
          {
            id: 2,
            question: 'Is the required PPE available, in good condition, and being worn correctly?',
            description: 'Check for PPE usage against identified hazards. Ear muffs and/or plugs in noise areas, gloves, masks, safety shoes. PPEs should be appropriate and clean'
          },
          {
            id: 3,
            question: 'Is the team actively participating in toolbox talks and awareness sessions. Is there a fire extinguisher and do members understand the operating procedure?',
                       description: 'Check for attendance register for monthly toolbox talk, check for practice of what has been discussed in previous toolbox talks. Test gemba owners on awareness of PASS in fire fighting'
          },
          {
            id: 4,
            question: 'Are first aid boxes available, accessible and well stocked? Team should provide record for lost time injury frequency rate',
            description: 'Check for expired first aid items in first aid boxes check for first aid check list should be valid for 3 months. For lost time, penalize as follows; 0-15 min (no penalty), 16-30 min (award half the marks), and no marks awarded for more than 30 min lost'
          },
          {
            id: 5,
            question: 'Is the team aware of the fire safety and emergency preparedness procedures?',
            description: 'Check for obstructed fire equipment, interview staff on awareness of the fire fighting procedures and whether they know where fire assembly point is. Check for unobstructed fire exits'
          }
        ]
      }
    ]
  },

  internal: {
    id: 'internal',
    name: '6S Internal Audit',
    code: 'CIL/OPEX/KAIZEN/REC/001',
    revision: '01',
    maxScore: 150,
    scope: 'General/Multi-area',
    isWeeklyFormat: true,
    sections: [
      {
        code: '1S',
        name: 'KUCHAGUA',
        english: 'Sort',
        maxPoints: 25,
        criteria: [
          {
            id: 1,
            question: 'Any unwanted items in the area?',
            description: ''
          },
          {
            id: 2,
            question: 'Any unwanted items on the wall, board etc?',
            description: ''
          },
          {
            id: 3,
            question: 'Any red tagged items stored for more than 3 weeks?',
            description: ''
          },
          {
            id: 4,
            question: 'Unwanted inventory, supplies, parts of material exists?',
            description: ''
          }
        ]
      },
      {
        code: '2S',
        name: 'KUPANGA',
        english: 'Set in Order',
        maxPoints: 25,
        criteria: [
          {
            id: 1,
            question: 'All items have a specific location for its storage?',
            description: ''
          },
          {
            id: 2,
            question: 'Are walkways and workstations clearly marked and identified?',
            description: ''
          },
          {
            id: 3,
            question: 'Are inventory, tools, equipments identified and kept in correct locations?',
            description: ''
          },
          {
            id: 4,
            question: 'Are items put away after use?',
            description: ''
          },
          {
            id: 5,
            question: 'Are there max and min indicators for supplies?',
            description: ''
          }
        ]
      },
      {
        code: '3S',
        name: 'KUSAFISHA',
        english: 'Shine',
        maxPoints: 25,
        criteria: [
          {
            id: 1,
            question: 'Machines, workstations, floor, wall and item in the area clean and maintained?',
            description: ''
          },
          {
            id: 2,
            question: 'Are checklists posted and updated?',
            description: ''
          },
          {
            id: 3,
            question: 'Are designated walkways/stairs free from dirt, oil, grease and dust?',
            description: ''
          }
        ]
      },
      {
        code: '4S',
        name: 'KUSANIFISHA',
        english: 'Standardize',
        maxPoints: 25,
        criteria: [
          {
            id: 1,
            question: 'Are display boards used and maintained well?',
            description: ''
          },
          {
            id: 2,
            question: 'Are specific cleaning tasks assigned?',
            description: ''
          },
          {
            id: 3,
            question: 'Are dust bins and scrap/recycle containers emptied on a fixed period?',
            description: ''
          },
          {
            id: 4,
            question: 'Staff is trained and fully understands 6S procedures?',
            description: ''
          }
        ]
      },
      {
        code: '5S',
        name: 'KUDUMISHA',
        english: 'Sustain',
        maxPoints: 25,
        criteria: [
          {
            id: 1,
            question: 'Is everyone involved in the improvement activities?',
            description: ''
          },
          {
            id: 2,
            question: 'Is 6S training given to all employees?',
            description: ''
          },
          {
            id: 3,
            question: '6S audits occur regularly?',
            description: ''
          },
          {
            id: 4,
            question: 'Are standardized work and cleaning procedure followed?',
            description: ''
          }
        ]
      },
      {
        code: '6S',
        name: 'KUSITIRISHA',
        english: 'Safety',
        maxPoints: 25,
        criteria: [
          {
            id: 1,
            question: 'Are there unidentified Hazards in gemba? All existing hazards should be tagged',
            description: ''
          },
          {
            id: 2,
            question: 'Is the working environment conducive to all employees? (e.g; Adequate light, noise level & thermal comfort)',
            description: ''
          },
          {
            id: 3,
            question: 'Is there fire extinguisher & SOP in place? Is there trained personnel to operate it?',
            description: ''
          },
          {
            id: 4,
            question: 'Are there safety signs/posters and do employees understand and follow them?',
            description: ''
          },
          {
            id: 5,
            question: 'Are all employees/visitors in appropriate PPE?',
            description: ''
          }
        ]
      }
    ]
  }
};


