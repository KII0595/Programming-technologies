from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BaseValidator(ABC):
    @abstractmethod
    def validate(self, value: Any) -> Any:
        pass


class NonNegativeFloatValidator(BaseValidator):
    def validate(self, value: Any) -> float:
        num = float(value)
        if num < 0:
            raise ValueError("Значение должно быть неотрицательным")
        return num


class NonEmptyStringValidator(BaseValidator):
    def validate(self, value: Any) -> str:
        s = str(value).strip()
        if not s:
            raise ValueError("Строка не может быть пустой")
        return s


class PayrollStrategy(ABC):
    @abstractmethod
    def compute(self, base: float, **params) -> float:
        pass


class DevPayrollStrategy(PayrollStrategy):
    LEVEL_MULTIPLIERS = {"junior": 1.0, "middle": 1.5, "senior": 2.0}

    def compute(self, base: float, level: str = "junior", **_) -> float:
        return base * self.LEVEL_MULTIPLIERS.get(level.lower(), 1.0)


class ManagerPayrollStrategy(PayrollStrategy):
    def compute(self, base: float, fixed_bonus: float = 0.0, **_) -> float:
        return base + fixed_bonus


class SalesPayrollStrategy(PayrollStrategy):
    def compute(self, base: float, rate: float = 0.1, sales_volume: float = 0.0, **_) -> float:
        return base + sales_volume * rate


class BonusPolicy(ABC):
    @abstractmethod
    def compute_bonus(self, base: float, **params) -> float:
        pass


class FixedPerformanceBonus(BonusPolicy):
    def compute_bonus(self, base: float, **_) -> float:
        return base * 0.10


class LevelBasedBonus(BonusPolicy):
    BONUS_RATES = {"junior": 0.05, "middle": 0.10, "senior": 0.20}

    def compute_bonus(self, base: float, level: str = "junior", **_) -> float:
        return base * self.BONUS_RATES.get(level.lower(), 0.05)


class StaffMember(ABC):
    @abstractmethod
    def full_salary(self) -> float: ...

    @abstractmethod
    def info(self) -> str: ...

    @abstractmethod
    def as_dict(self) -> Dict[str, Any]: ...


class Employee(StaffMember):
    def __init__(
        self,
        name: str,
        dept: str,
        base_pay: float,
        emp_id: int = 0,
        payroll: Optional[PayrollStrategy] = None,
        bonus: Optional[BonusPolicy] = None,
    ):
        self._name = NonEmptyStringValidator().validate(name)
        self._dept = dept
        self._base = NonNegativeFloatValidator().validate(base_pay)
        self._id = emp_id
        self._payroll = payroll or DevPayrollStrategy()
        self._bonus = bonus or FixedPerformanceBonus()

    @property
    def emp_id(self) -> int:
        return self._id

    @property
    def name(self) -> str:
        return self._name

    def full_salary(self) -> float:
        return self._payroll.compute(self._base) + self._bonus.compute_bonus(self._base)

    def info(self) -> str:
        return f"{self._name} (ID: {self._id}) – ${self.full_salary():.2f}"

    def as_dict(self) -> Dict[str, Any]:
        return {
            "id": self._id,
            "name": self._name,
            "department": self._dept,
            "base": self._base,
            "total": self.full_salary(),
        }


class Developer(Employee):
    def __init__(self, name: str, dept: str, base_pay: float, level: str = "junior", skills: Optional[List[str]] = None, emp_id: int = 0):
        self._level = level.lower()
        self._skills = skills or []
        super().__init__(
            name=name,
            dept=dept,
            base_pay=base_pay,
            emp_id=emp_id,
            payroll=DevPayrollStrategy(),
            bonus=LevelBasedBonus(),
        )

    def full_salary(self) -> float:
        return (
            self._payroll.compute(self._base, level=self._level)
            + self._bonus.compute_bonus(self._base, level=self._level)
        )


class Manager(Employee):
    def __init__(self, name: str, dept: str, base_pay: float, fixed_bonus: float = 0.0, emp_id: int = 0):
        self._fixed_bonus = fixed_bonus
        super().__init__(
            name=name,
            dept=dept,
            base_pay=base_pay,
            emp_id=emp_id,
            payroll=ManagerPayrollStrategy(),
            bonus=FixedPerformanceBonus(),
        )

    def full_salary(self) -> float:
        return (
            self._payroll.compute(self._base, fixed_bonus=self._fixed_bonus)
            + self._bonus.compute_bonus(self._base)
        )


class SalesPerson(Employee):
    def __init__(self, name: str, dept: str, base_pay: float, commission: float = 0.1, emp_id: int = 0):
        self._commission = commission
        self._sales_volume = 0.0
        super().__init__(
            name=name,
            dept=dept,
            base_pay=base_pay,
            emp_id=emp_id,
            payroll=SalesPayrollStrategy(),
        )

    def record_sale(self, amount: float) -> None:
        self._sales_volume += NonNegativeFloatValidator().validate(amount)

    def full_salary(self) -> float:
        return self._payroll.compute(
            self._base, rate=self._commission, sales_volume=self._sales_volume
        )


class EmployeeStorage(ABC):
    @abstractmethod
    def save(self, emp: Employee) -> None: ...

    @abstractmethod
    def list_all(self) -> List[Employee]: ...


class MemoryStorage(EmployeeStorage):
    def __init__(self):
        self._data: Dict[int, Employee] = {}
        self._counter = 1

    def save(self, emp: Employee) -> None:
        if emp.emp_id == 0:
            emp._id = self._counter
            self._data[self._counter] = emp
            self._counter += 1
        else:
            self._data[emp.emp_id] = emp

    def list_all(self) -> List[Employee]:
        return list(self._data.values())


class Organization:
    def __init__(self, title: str, storage: Optional[EmployeeStorage] = None):
        self._title = title
        self._storage = storage or MemoryStorage()

    def add_employee(self, emp: Employee) -> None:
        self._storage.save(emp)

    def employees(self) -> List[Employee]:
        return self._storage.list_all()

    def total_payroll(self) -> float:
        return sum(e.full_salary() for e in self._storage.list_all())

    def headcount(self) -> int:
        return len(self._storage.list_all())


def demo() -> None:
    print("Запуск демонстрации...\n")
    print("Список сотрудников:")
    
    dev = Developer("Максим Кузнецов", "Разработка", 5000, "senior", ["Python", "FastAPI"])
    mgr = Manager("Ольга Иванова", "Управление", 8000, 2000)
    sales = SalesPerson("Сергей Петров", "Продажи", 3000, 0.15)

    org = Organization("InnoTech")
    org.add_employee(dev)
    org.add_employee(mgr)
    org.add_employee(sales)
    sales.record_sale(5000)

    for e in org.employees():
        print(f"- {e.info()}")

    print("\nОбщая статистика:")
    print(f"Количество сотрудников: {org.headcount()}")
    print(f"Фонд заработной платы: ${org.total_payroll():.2f}")
    avg = org.total_payroll() / org.headcount() if org.headcount() else 0
    print(f"Средняя зарплата: ${avg:.2f}")

    print("\nДемонстрация завершена")


if __name__ == "__main__":
    demo()
