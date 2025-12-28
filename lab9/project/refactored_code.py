from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any


# Валидаторы и стратегии (стиль Куйбышева — лаконичный)
class Validator(ABC):
    @abstractmethod
    def validate(self, value: Any) -> Any:
        pass


class PositiveNumberValidator(Validator):
    def validate(self, value: Any) -> float:
        num = float(value)
        if num < 0:
            raise ValueError("число должно быть >0")
        return num


class StringNotEmptyValidator(Validator):
    def validate(self, value: Any) -> str:
        if not value or not str(value).strip():
            raise ValueError("строка не может быть пустой")
        return str(value).strip()


class SalaryStrategy(ABC):
    @abstractmethod
    def calculate(self, **kwargs) -> float:
        pass


class DeveloperSalaryStrategy(SalaryStrategy):
    MULTIPLIERS = {"junior": 1.0, "middle": 1.5, "senior": 2.0}

    def calculate(self, base_salary: float, seniority: str = "junior", **kwargs) -> float:
        return base_salary * self.MULTIPLIERS.get(seniority, 1.0)


class ManagerSalaryStrategy(SalaryStrategy):
    def calculate(self, base_salary: float, bonus: float = 0, **kwargs) -> float:
        return base_salary + bonus


class SalespersonSalaryStrategy(SalaryStrategy):
    def calculate(self, base_salary: float, commission_rate: float = 0.1,
                  total_sales: float = 0, **kwargs) -> float:
        return base_salary + total_sales * commission_rate


class BonusStrategy(ABC):
    @abstractmethod
    def calculate_bonus(self, base_salary: float, **kwargs) -> float:
        pass


class PerformanceBonusStrategy(BonusStrategy):
    def calculate_bonus(self, base_salary: float, **kwargs) -> float:
        return base_salary * 0.1


class SeniorityBonusStrategy(BonusStrategy):
    RATES = {"junior": 0.05, "middle": 0.10, "senior": 0.20}

    def calculate_bonus(self, base_salary: float, seniority: str = "junior", **kwargs) -> float:
        return base_salary * self.RATES.get(seniority, 0.05)


# Интерфейсы
class ISalaryCalculable(ABC):
    @abstractmethod
    def calculate_salary(self) -> float: ...


class IInfoProvidable(ABC):
    @abstractmethod
    def get_info(self) -> str: ...


class ISerializable(ABC):
    @abstractmethod
    def to_dict(self) -> Dict[str, Any]: ...


# Базовый сотрудник
class Employee(ISalaryCalculable, IInfoProvidable, ISerializable):
    def __init__(
        self,
        name: str,
        department: str,
        base_salary: float,
        employee_id: int = 0,
        salary_strategy: Optional[SalaryStrategy] = None,
        bonus_strategy: Optional[BonusStrategy] = None,
    ):
        self.__name = StringNotEmptyValidator().validate(name)
        self.__department = department
        self.__base_salary = PositiveNumberValidator().validate(base_salary)
        self.__id = employee_id
        self._salary_strategy = salary_strategy or DeveloperSalaryStrategy()
        self._bonus_strategy = bonus_strategy or PerformanceBonusStrategy()

    @property
    def id(self) -> int:
        return self.__id

    @property
    def name(self) -> str:
        return self.__name

    @property
    def base_salary(self) -> float:
        return self.__base_salary

    def calculate_salary(self) -> float:
        base = self._salary_strategy.calculate(base_salary=self.__base_salary)
        bonus = self._bonus_strategy.calculate_bonus(base_salary=self.__base_salary)
        return base + bonus

    def get_info(self) -> str:
        return f"{self.name} (ID: {self.__id}) - ${self.calculate_salary():.2f}"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.__id,
            "name": self.__name,
            "department": self.__department,
            "base_salary": self.__base_salary,
            "total_salary": self.calculate_salary(),
        }

    # Добавлено "другим студентом" для удобной отладки
    def __repr__(self) -> str:
        return f"<Employee {self.name} salary=${self.calculate_salary():.2f}>"


# Конкретные типы сотрудников
class Developer(Employee):
    def __init__(
        self,
        name: str,
        department: str,
        base_salary: float,
        seniority: str = "junior",
        skills: Optional[List[str]] = None,
        employee_id: int = 0,
    ):
        self.__seniority = seniority
        self.__skills: List[str] = skills or []
        super().__init__(
            name=name,
            department=department,
            base_salary=base_salary,
            employee_id=employee_id,
            salary_strategy=DeveloperSalaryStrategy(),
            bonus_strategy=SeniorityBonusStrategy(),
        )

    def calculate_salary(self) -> float:
        return (
            self._salary_strategy.calculate(base_salary=self.base_salary, seniority=self.__seniority)
            + self._bonus_strategy.calculate_bonus(base_salary=self.base_salary, seniority=self.__seniority)
        )


class Manager(Employee):
    def __init__(
        self,
        name: str,
        department: str,
        base_salary: float,
        bonus: float = 0,
        employee_id: int = 0,
    ):
        self.__bonus = bonus
        super().__init__(
            name=name,
            department=department,
            base_salary=base_salary,
            employee_id=employee_id,
            salary_strategy=ManagerSalaryStrategy(),
            bonus_strategy=PerformanceBonusStrategy(),
        )

    def calculate_salary(self) -> float:
        return (
            self._salary_strategy.calculate(base_salary=self.base_salary, bonus=self.__bonus)
            + self._bonus_strategy.calculate_bonus(base_salary=self.base_salary)
        )


class Salesperson(Employee):
    def __init__(
        self,
        name: str,
        department: str,
        base_salary: float,
        commission_rate: float = 0.1,
        employee_id: int = 0,
    ):
        self.__commission_rate = commission_rate
        self.__total_sales = 0.0
        super().__init__(
            name=name,
            department=department,
            base_salary=base_salary,
            employee_id=employee_id,
            salary_strategy=SalespersonSalaryStrategy(),
        )

    def add_sales(self, amount: float) -> None:
        self.__total_sales += PositiveNumberValidator().validate(amount)

    @property
    def total_sales(self) -> float:  # Стиль другого студента — открытый геттер
        return self.__total_sales

    def calculate_salary(self) -> float:
        return self._salary_strategy.calculate(
            base_salary=self.base_salary,
            commission_rate=self.__commission_rate,
            total_sales=self.__total_sales,
        )


# === Factory — явно "чужой" вклад ===
class EmployeeFactory:
    """Фабрика для удобного создания сотрудников (предложена одногруппником)"""

    @staticmethod
    def create_developer(
        name: str,
        department: str,
        base_salary: float,
        seniority: str = "junior",
        skills: Optional[List[str]] = None,
    ) -> Developer:
        return Developer(name, department, base_salary, seniority, skills)

    @staticmethod
    def create_manager(name: str, department: str, base_salary: float, bonus: float = 0) -> Manager:
        return Manager(name, department, base_salary, bonus)

    @staticmethod
    def create_salesperson(
        name: str, department: str, base_salary: float, commission_rate: float = 0.1
    ) -> Salesperson:
        return Salesperson(name, department, base_salary, commission_rate)


# Repository с автогенерацией ID (улучшение от "другого студента")
class IEmployeeRepository(ABC):
    @abstractmethod
    def add(self, employee: Employee) -> None: ...

    @abstractmethod
    def get_all(self) -> List[Employee]: ...


class InMemoryEmployeeRepository(IEmployeeRepository):
    def __init__(self):
        self._employees: Dict[int, Employee] = {}
        self._next_id = 1

    def add(self, employee: Employee) -> None:
        if employee.id == 0:
            # Прямой доступ к приватному полю — типичный "чужой" стиль
            employee._Employee__id = self._next_id
            self._employees[self._next_id] = employee
            self._next_id += 1
        else:
            self._employees[employee.id] = employee

    def get_all(self) -> List[Employee]:
        return list(self._employees.values())


# Company с дополнительным методом
class Company:
    def __init__(self, name: str, repository: Optional[IEmployeeRepository] = None):
        self.__name = name
        self.__repository = repository or InMemoryEmployeeRepository()

    def hire_employee(self, employee: Employee) -> None:
        self.__repository.add(employee)

    def get_all_employees(self) -> List[Employee]:
        return self.__repository.get_all()

    def calculate_total_salary(self) -> float:
        return sum(emp.calculate_salary() for emp in self.__repository.get_all())

    def get_average_salary(self) -> float:  # Добавлено "другим студентом"
        employees = self.__repository.get_all()
        return self.calculate_total_salary() / len(employees) if employees else 0.0

    def get_employee_count(self) -> int:
        return len(self.__repository.get_all())


# Demo — смешанный стиль, использует Factory и новые имена
def main():
    print("demo processing...")

    dev = EmployeeFactory.create_developer(
        name="Alice Smith",
        department="DEV",
        base_salary=5000,
        seniority="senior",
        skills=["Python", "Docker"],
    )
    manager = EmployeeFactory.create_manager(
        name="Bob Johnson", department="MGMT", base_salary=8000, bonus=2000
    )
    salesperson = EmployeeFactory.create_salesperson(
        name="Charlie Brown", department="SALES", base_salary=3000, commission_rate=0.15
    )

    company = Company("TechCorp")
    company.hire_employee(dev)
    company.hire_employee(manager)
    company.hire_employee(salesperson)
    salesperson.add_sales(5000)

    print("\n1. Сотрудники:")
    for emp in company.get_all_employees():
        print(f"- {emp.get_info()}")

    print("\n2. Статистика компании:")
    print(f"- Всего сотрудников: {company.get_employee_count()}")
    print(f"- Общая зарплата: ${company.calculate_total_salary():.2f}")
    print(f"- Средняя зарплата: ${company.get_average_salary():.2f}")

    print("demo end")


if __name__ == "__main__":
    main()
