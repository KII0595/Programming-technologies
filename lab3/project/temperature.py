def c_to_f(celsius):
    return (celsius * 9/5) + 32

def f_to_c(fahrenheit):
    return (fahrenheit - 32) * 5/9

def c_to_k(celsius):
    """Цельсии в Кельвины"""
    return celsius + 273.15

def k_to_c(kelvin):
    return kelvin - 273.15

if __name__ == "__main__":
    print("Конвертер температуры (C, F, K)")
    try:
        temp = float(input("Введите температуру: "))
        unit = input("Единица (C/F/K): ").strip().upper()
        
        if unit == "C":
            print(f"{temp}°C = {c_to_f(temp):.2f}°F")
            print(f"{temp}°C = {c_to_k(temp):.2f} K")
        elif unit == "F":
            c = f_to_c(temp)
            print(f"{temp}°F = {c:.2f}°C")
            print(f"{temp}°F = {c_to_k(c):.2f} K")
        elif unit == "K":
            c = k_to_c(temp)
            print(f"{temp} K = {c:.2f}°C")
            print(f"{temp} K = {c_to_f(c):.2f}°F")
        else:
            print("Поддерживаются только C, F, K")
    except ValueError:
        print("Ошибка: введите числовое значение температуры")
