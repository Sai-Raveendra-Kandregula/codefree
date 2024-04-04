import os
import json

def get_misra_mapping():
    dir_path = os.path.dirname(os.path.realpath(__file__))
    dir_path = os.path.dirname(dir_path)
    misra_mapping_path = os.path.join(dir_path, 'resources', 'misra_cppcheck_rules.txt')
    out_object = {}
    if os.path.exists(misra_mapping_path):
        with open(misra_mapping_path) as misra_map_file:
            for line in misra_map_file:
                if line.startswith("#"):
                    continue
                elif line.startswith("Appendix A	Summary of guidelines"):
                    continue
                else:
                    obj = {}
                    obj['rule_type'] = line.split("\t")[0].split()[0].strip('\t\n')
                    obj['rule_no'] = line.split("\t")[0].split()[1].strip('\t\n')
                    obj['severity'] = line.split("\t")[1].strip('\t\n')
                    obj['description'] = next(misra_map_file, "").strip('\t\n')
                    out_object[f"{obj['rule_type']}_{obj['rule_no']}"] = obj
                    
        
    return out_object
    
# print(json.dumps(get_misra_mapping(), indent=2))