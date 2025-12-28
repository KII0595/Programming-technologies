import pytest
from refactored_code import (
    PositiveNumberValidator,
    StringNotEmptyValidator,
    DeveloperSalaryStrategy,
    ManagerSalaryStrategy,
    SalespersonSalaryStrategy,
    PerformanceBonusStrategy,
    SeniorityBonusStrategy,
    Employee,
    Developer,
    Manager,
    Salesperson,
    InMemoryEmployeeRepository,
    Company,
)

# tests for validators

class TestPositiveNumberValidator:

    @pytest.fixture
    def validator(self):
        return PositiveNumberValidator()

    def test_valid(self, validator):
        assert validator.validate(100) == 100.0
        assert validator.validate(0.5) == 0.5
        assert validator.validate(0) == 0.0

    def test_invalid(self, validator):
        with pytest.raises(ValueError):
            validator.validate(-1)
        with pytest.raises(ValueError):
            validator.validate("abc")

    def test_string_conversion(self, validator):
        assert validator.validate("50") == 50.0


class TestStringNotEmptyValidator:

    @pytest.fixture
    def validator(self):
        return StringNotEmptyValidator()

    def test_valid(self, validator):
        assert validator.validate("John") == "John"
        assert validator.validate("  Alice  ") == "Alice"

    def test_invalid(self, validator):
        for value in ["", "   ", None]:
            with pytest.raises(ValueError):
                validator.validate(value)


# tests for salary strategies

class TestDeveloperSalaryStrategy:

    @pytest.fixture
    def strategy(self):
        return DeveloperSalaryStrategy()

    def test_levels(self, strategy):
        assert strategy.calculate(1000, "junior") == 1000
        assert strategy.calculate(1000, "middle") == 1500
        assert strategy.calculate(1000, "senior") == 2000
        assert strategy.calculate(1000, "unknown") == 1000


class TestManagerSalaryStrategy:

    @pytest.fixture
    def strategy(self):
        return ManagerSalaryStrategy()

    def test_salary(self, strategy):
        assert strategy.calculate(5000) == 5000
        assert strategy.calculate(5000, 1000) == 6000
        assert strategy.calculate(5000, 0) == 5000


class TestSalespersonSalaryStrategy:

    @pytest.fixture
    def strategy(self):
        return SalespersonSalaryStrategy()

    def test_sales(self, strategy):
        assert strategy.calculate(2000) == 2000
        assert strategy.calculate(2000, total_sales=5000) == 2500
        assert strategy.calculate(2000, 0.15, 5000) == 2750


# tests for bonus strategies

class TestPerformanceBonusStrategy:

    @pytest.fixture
    def strategy(self):
        return PerformanceBonusStrategy()

    def test_bonus(self, strategy):
        assert strategy.calculate_bonus(1000) == 100
        assert strategy.calculate_bonus(0) == 0


class TestSeniorityBonusStrategy:

    @pytest.fixture
    def strategy(self):
        return SeniorityBonusStrategy()

    def test_bonus(self, strategy):
        assert strategy.calculate_bonus(1000, "junior") == 50
        assert strategy.calculate_bonus(1000, "middle") == 100
        assert strategy.calculate_bonus(1000, "senior") == 200
        assert strategy.calculate_bonus(1000, "unknown") == 50


# tests for employees

class TestEmployee:

    @pytest.fixture
    def employee(self):
        return Employee(
            name="John",
            department="IT",
            base_salary=5000,
            employee_id=1,
            salary_strategy=DeveloperSalaryStrategy(),
            bonus_strategy=PerformanceBonusStrategy()
        )

    def test_creation(self, employee):
        assert employee.name == "John"
        assert employee.id == 1

    def test_invalid(self):
        with pytest.raises(ValueError):
            Employee("", "IT", 1000, salary_strategy=DeveloperSalaryStrategy(), bonus_strategy=PerformanceBonusStrategy())
        with pytest.raises(ValueError):
            Employee("John", "IT", -1000, salary_strategy=DeveloperSalaryStrategy(), bonus_strategy=PerformanceBonusStrategy())

    def test_to_dict(self, employee):
        data = employee.to_dict()
        assert "total_salary" in data


class TestDeveloper:

    def test_salary(self):
        dev = Developer("Alice", "DEV", 2000, "junior", employee_id=1)
        assert dev.calculate_salary() == 2100

        dev = Developer("Bob", "DEV", 3000, "senior", employee_id=2)
        assert dev.calculate_salary() == 6600


class TestManager:

    def test_salary(self):
        mgr = Manager("Diana", "MGMT", 5000, 2000, employee_id=1)
        assert mgr.calculate_salary() == 7500


class TestSalesperson:

    def test_salary(self):
        sales = Salesperson("George", "SALES", 2000, 0.1, employee_id=1)
        sales.add_sales(5000)
        assert sales.calculate_salary() == 2500


# tests for repository

class TestInMemoryEmployeeRepository:

    def test_add(self):
        repo = InMemoryEmployeeRepository()
        emp = Developer("Alice", "DEV", 2000, employee_id=1)
        repo.add(emp)
        assert len(repo.get_all()) == 1


# tests for company

class TestCompany:

    @pytest.fixture
    def company(self):
        return Company("TechCorp", InMemoryEmployeeRepository())

    def test_workflow(self, company):
        company.hire_employee(Developer("Alice", "DEV", 2000, "junior", 1))
        company.hire_employee(Developer("Bob", "DEV", 3000, "senior", 2))
        company.hire_employee(Manager("Diana", "MGMT", 5000, 1000, 3))
        assert company.calculate_total_salary() == 15200


# integration tests

class TestIntegration:

    def test_full_flow(self):
        company = Company("Startup", InMemoryEmployeeRepository())

        dev = Developer("Alice", "DEV", 4000, "senior", employee_id=1)
        mgr = Manager("Bob", "MGMT", 6000, 2000, employee_id=2)
        sales = Salesperson("Charlie", "SALES", 2000, 0.15, employee_id=3)

        company.hire_employee(dev)
        company.hire_employee(mgr)
        company.hire_employee(sales)

        sales.add_sales(10000)
        assert company.calculate_total_salary() == 20900


# parametrized tests

@pytest.mark.parametrize("base_salary,seniority,mult,bonus", [
    (1000, "junior", 1.0, 0.05),
    (1000, "middle", 1.5, 0.10),
    (1000, "senior", 2.0, 0.20),
])
def test_dev_salary_param(base_salary, seniority, mult, bonus):
    dev = Developer("Test", "DEV", base_salary, seniority, employee_id=1)
    assert dev.calculate_salary() == base_salary * mult + base_salary * bonus


# edge cases

class TestEdgeCases:

    def test_zero_salary(self):
        dev = Developer("Test", "DEV", 0, "junior", employee_id=1)
        assert dev.calculate_salary() == 0

    def test_large_salary(self):
        mgr = Manager("Test", "MGMT", 999999, 100000, employee_id=1)
        assert mgr.calculate_salary() == 999999 + 100000 + 99999.9


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
