"""
真职（Zjob）数据采集任务调度占位模块
Phase 1 暂不接入真实爬取，仅定义任务接口与示例。
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List


class BaseScraper(ABC):
    """爬虫基类，所有具体爬虫需继承并实现 run 方法。"""

    name: str = "base"

    @abstractmethod
    def run(self, company_name: str) -> Dict[str, Any]:
        """返回该公司的原始采集数据。"""
        raise NotImplementedError


class MaimaiScraper(BaseScraper):
    name = "maimai"

    def run(self, company_name: str) -> Dict[str, Any]:
        # TODO: 接入脉脉真实采集逻辑
        return {"source": "maimai", "company": company_name, "reviews": []}


class KanzhunScraper(BaseScraper):
    name = "kanzhun"

    def run(self, company_name: str) -> Dict[str, Any]:
        # TODO: 接入看准真实采集逻辑
        return {"source": "kanzhun", "company": company_name, "reviews": []}


class QichachaScraper(BaseScraper):
    name = "qichacha"

    def run(self, company_name: str) -> Dict[str, Any]:
        # TODO: 接入企查查工商/财报采集逻辑
        return {"source": "qichacha", "company": company_name, "basic": {}}


SCRAPER_REGISTRY: Dict[str, BaseScraper] = {
    "maimai": MaimaiScraper(),
    "kanzhun": KanzhunScraper(),
    "qichacha": QichachaScraper(),
}


def collect_company(company_name: str, sources: List[str] | None = None) -> Dict[str, Any]:
    """
    按指定来源采集一家公司数据。
    :param company_name: 公司名称
    :param sources: 来源列表，默认全部
    :return: 各来源采集结果
    """
    if sources is None:
        sources = list(SCRAPER_REGISTRY.keys())

    result = {"company": company_name, "data": {}}
    for src in sources:
        scraper = SCRAPER_REGISTRY.get(src)
        if scraper:
            result["data"][src] = scraper.run(company_name)
    return result


if __name__ == "__main__":
    print(collect_company("特斯拉（上海）有限公司"))
