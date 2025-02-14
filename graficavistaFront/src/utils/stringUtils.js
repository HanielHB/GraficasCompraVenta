export const generoForDisplay = (genero) => {
    if (genero === 1) {
        return "Masculino";
    } else if (genero === 0) {
        return "Femenino";
    } else {
        return "Indefinido";
    }
}