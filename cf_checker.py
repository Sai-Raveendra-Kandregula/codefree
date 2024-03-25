from typing import Dict, List, Callable, Any, TypeAlias

checking_modules = []

CheckingFunction : TypeAlias = Callable[[ Any, dict ], dict]

class CheckingModule():
    moduleName : str # Use underscore for multiple words
    checker : CheckingFunction
    checkerHelp : str

    @classmethod
    def modules(cls):
        return checking_modules
    
    def register(self):
        checking_modules.append(self)