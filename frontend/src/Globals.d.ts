// if you use css
declare module "*.module.css" {
    const classes: { [key: string]: string };
    export default classes;
}

// if you use scss
declare module "*.module.scss" {
    const classes: { [key: string]: string };
    export default classes;
}

// if you use less
declare module "*.module.less" {
    const classes: { [key: string]: string };
    export default classes;
}