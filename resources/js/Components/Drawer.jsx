import { Drawer as AntDrawer } from "antd";


export default function Drawer({
    show = false,
    onClose = () => {},
    placement = "right",
    size = "default",
    title = "",
    icon = null,
    children,
    className = "",
}) {
    return (
        <AntDrawer
            open={show}
            onClose={onClose}
            placement={placement}
            size={size}
            className={className}
            closeIcon={
                <span className="text-red-500 text-lg hover:text-red-700 rounded-full">
                    ✕
                </span>
            }
            title={
                <div className="flex items-center gap-2 text-lg font-bold">
                    {icon}
                    <span>{title}</span>
                </div>
            }
        >
            {children}
        </AntDrawer>
    );
}