# 编译与运行linux内核

## 环境准备

- docker: 用于构建和管理编译环境，方便管理，并且docker的隔离可以无需更改Host环境
- git: 用于拉取linux源代码
- qemu-system-x86_64: 用于模拟x86_64架构的计算机，运行编译好的内核

## 下载linux源码
> -b v6.17参数指定下载的commit，--depth 1表示只拉取最新的commit，节省空间和时间

```sh
git clone http://github.com/torvalds/linux.git -b v6.17 --depth 1
```

## 准备docker环境

先通过docker build构建docker编译环境，安装Linux内核编译的所有依赖

```sh
docker build -t build-env-linux -f - $(mktemp -dp .) << EOF
FROM ubuntu:24.04

# 设置非交互模式，避免安装过程中出现交互提示
ENV DEBIAN_FRONTEND=noninteractive

# 安装编译Linux内核所需的依赖
RUN apt update
RUN apt install -y make clang llvm lld bc flex bison libssl-dev libelf-dev dwarves

RUN id ${UID} || useradd -ms /bin/bash builder -u ${UID} -g ${GROUPS}
USER ${UID}
WORKDIR /ws
EOF
```

## 编译内核

### 进入docker环境

docker run命令启动一个新的容器实例，参数说明如下：
- `--rm`：容器退出后自动删除容器，避免占用空间
- `-it`：以交互模式运行容器，允许我们在容器内执行命令
- `-v $(realpath .):/ws`：将当前目录挂载到容器内的/ws目录，方便访问源码和输出

```sh
docker run --rm -it -v $(realpath .):/ws build-env-linux
```

### 查看可用的make targets

make是Linux内核的构建工具，Makefile定义了各种编译目标(targets)，可以通过`make help`命令查看所有可用的targets，help本身也是一个target，在Makefile中定义。
- `-C linux`指定在linux目录下执行make命令

```sh
make -C linux help
```


### 使用默认配置

linux内核编译前需要先配置内核选项，使用`defconfig`可以生成一个默认配置文件，适用于大多数x86_64平台
如果需要自定义配置，可以使用`make menuconfig`命令进入图形化配置界面进行修改
参数说明如下：
- `O=../built`指定输出目录为built，避免污染源码目录
- `LLVM=1`表示使用clang/llvm工具链进行编译

```sh
make -C linux LLVM=1 O=../built defconfig
```

### 编译内核

编译的target是`bzImage`，表示编译一个压缩的内核镜像，可以直接用来启动内核
编译成功的内核镜像会生成在built/arch/x86/boot/bzImage
`-j$(nproc)`表示使用所有可用的CPU核心进行并行编译，加快编译速度

```sh
make -C linux LLVM=1 O=../built bzImage -j$(nproc)
```

### 退出docker环境

ext退出shell的同时，也会退出docker容器，由于run时使用了--rm参数，容器会被自动删除
```sh
exit
```

## 运行内核

qemu是一个开源的虚拟机软件，可以模拟各种硬件平台，运行不同架构的操作系统
运行内核镜像，参数说明如下：
- `-nographic`：不使用图形界面，所有输出都在终端显示
- `-kernel`：指定要加载的内核镜像文件路径
- `-append`：传递给内核的启动参数，这里指定使用串口控制台`ttyS0`，与`-nographic`配合使用

```sh
qemu-system-x86_64 -nographic \
-kernel built/arch/x86/boot/bzImage \
-append "console=ttyS0"
```

启动后，可以看到内核启动后的日志，但是panic了，报错找不到根目录，这个是正常的，因为我们只提供了内核，没有准备initramfs作为根目录，但是内核日志已经成功输出，说明内核编译和运行成功。
