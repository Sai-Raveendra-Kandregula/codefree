from typing import Dict, List, Callable, Any, TypeAlias

checking_modules = []

CheckingFunction : TypeAlias = Callable[[ Any, dict ], dict]

class CheckingModule():
    moduleName : str # Hyphenate for multiple words
    checker : CheckingFunction

    @classmethod
    def modules(cls):
        return checking_modules
    
    def register(self):
        checking_modules.append(self)